/** Busca pública para futuras postagens. Créditos retornados devem acompanhar cada foto. */
export async function buscarImagensCommons(termo,limite=3){
 if(typeof termo!=='string'||!termo.trim())throw new Error('Informe um tema.');
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 url.search=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:termo,gsrnamespace:'6',gsrlimit:String(Math.max(1,Math.min(10,limite))),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1400'});
 const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('Não foi possível consultar as imagens. Tente novamente mais tarde.');
 const data=await response.json();if(data.error)throw new Error('Busca indisponível.');
 const plain=html=>{const doc=new DOMParser().parseFromString(html||'','text/html');return doc.body.textContent||'';};
 return Object.values(data.query?.pages||{}).flatMap(p=>{const info=p.imageinfo?.[0];if(!info)return[];return[{title:p.title,url:info.thumburl||info.url,source:info.descriptionurl,author:plain(info.extmetadata?.Artist?.value),license:plain(info.extmetadata?.LicenseShortName?.value),licenseUrl:info.extmetadata?.LicenseUrl?.value||'',description:plain(info.extmetadata?.ImageDescription?.value)}];});
}
