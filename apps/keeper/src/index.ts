import 'dotenv/config';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
console.log('Keeper running…');
cron.schedule('* * * * *', async ()=>{
 const now=new Date();
 const due=await prisma.round.findMany({where:{status:'open',due_at:{lte:now}},include:{circle:{include:{members:true}},contributions:true}});
 for(const r of due){const required=r.circle.members.length; const got=r.contributions.filter(c=>c.status==='succeeded').length; if(got===required){await prisma.round.update({where:{id:r.id},data:{status:'funded'}});}}
});
