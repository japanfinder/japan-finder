const json = (body, status=200) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const blocked = /(?:weapon|firearm|gun|rifle|pistol|ammunition|knife|blade|sword|taser|pepper spray|vape|cigarette|tobacco|alcohol|liquor|beer|wine|cannabis|marijuana|drug|gambling|betting|casino|pornograph|sex toy)/i;
export async function onRequestPost({request,env}) {
 if(!env.GOOGLE_VISION_API_KEY)return json({error:'AI recognition is not configured yet. Ask the site administrator to set up the Google Cloud Vision API.'},503);
 const len=Number(request.headers.get('content-length')||0);
 if(len>5_500_000)return json({error:'Image too large. Please choose an image under 4 MB.'},413);
 let form;try{form=await request.formData();}catch{return json({error:'Invalid upload.'},400);}
 const file=form.get('image');
 if(!file||typeof file.arrayBuffer!=='function'||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4_000_000||file.size<100)return json({error:'Please upload a JPG, PNG or WEBP image under 4 MB.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const base64=btoa(binary);
 let response;
 try{
  response=await fetch('https://vision.googleapis.com/v1/images:annotate?key='+encodeURIComponent(env.GOOGLE_VISION_API_KEY),{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests:[{image:{content:base64},features:[{type:'WEB_DETECTION',maxResults:6},{type:'TEXT_DETECTION',maxResults:3},{type:'LABEL_DETECTION',maxResults:8},{type:'SAFE_SEARCH_DETECTION'}]}]})
  });
 }catch{return json({error:'Recognition service is temporarily unavailable.'},502);}
 if(!response.ok)return json({error:'Recognition provider rejected the request. Check the server configuration and billing.'},502);
 let data;try{data=await response.json();}catch{return json({error:'Invalid recognition response.'},502);}
 const item=data.responses?.[0]||{};
 if(item.error)return json({error:'The recognition provider could not process this photo.'},502);
 const safety=item.safeSearchAnnotation||{};
 if(['LIKELY','VERY_LIKELY'].some(x=>safety.adult===x||safety.violence===x||safety.racy===x))return json({error:'This image cannot be searched on JAPAN FINDER.'},400);
 const guess=item.webDetection?.bestGuessLabels?.map(x=>x.label).find(Boolean);
 const entity=item.webDetection?.webEntities?.filter(x=>x.description&&x.score>=0.45).sort((a,b)=>(b.score||0)-(a.score||0))[0]?.description;
 const text=item.textAnnotations?.[0]?.description?.replace(/\s+/g,' ').trim().slice(0,80);
 const label=item.labelAnnotations?.slice(0,2).map(x=>x.description).join(' ');
 const query=[guess,entity,text,label].find(x=>x&&x.length>=3)?.slice(0,110)||'';
 if(blocked.test([guess,entity,text,label].filter(Boolean).join(' ')))return json({error:'This item category is not supported.'},400);
 if(!query)return json({error:'Could not identify the product. Please enter its name or some clues.'},422);
 return json({query,source:'Google Cloud Vision',note:'This is a suggested search term, not a verified product identification.'});
}
export function onRequest(){return json({error:'Method not allowed.'},405);}
