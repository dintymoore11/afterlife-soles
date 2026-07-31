const attempts = new Map<string,{count:number;reset:number}>();
export async function POST(request:Request){
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"local";const now=Date.now();const rate=attempts.get(ip);if(rate&&rate.reset>now&&rate.count>=5)return Response.json({error:"Too many messages"},{status:429});attempts.set(ip,{count:rate&&rate.reset>now?rate.count+1:1,reset:now+60_000});
  const body=await request.json() as Record<string,string>;if(body.website)return Response.json({ok:true});if(!body.name||!body.email||!body.subject||!body.message)return Response.json({error:"Missing fields"},{status:400});
  if(process.env.TURNSTILE_SECRET_KEY&&body.turnstileToken){const data=new FormData();data.set("secret",process.env.TURNSTILE_SECRET_KEY);data.set("response",body.turnstileToken);const check=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:data});const verdict=await check.json() as {success:boolean};if(!verdict.success)return Response.json({error:"Verification failed"},{status:400})}
  if(!process.env.RESEND_API_KEY)return Response.json({ok:true,preview:true});
  const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL||"AfterLife Soles <onboarding@resend.dev>",to:[process.env.CONTACT_TO_EMAIL||"smoore.us@gmail.com"],reply_to:body.email,subject:`AfterLife Soles: ${body.subject}`,text:`From: ${body.name} <${body.email}>\n\n${body.message}`})});
  return sent.ok?Response.json({ok:true}):Response.json({error:"Delivery failed"},{status:502});
}
