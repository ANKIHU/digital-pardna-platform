import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
async function main(){
 const a=await prisma.user.upsert({where:{email:'alice@example.com'},update:{},create:{name:'Alice',email:'alice@example.com',phone:'+18765550101'}});
 const b=await prisma.user.upsert({where:{email:'bob@example.com'},update:{},create:{name:'Bob',email:'bob@example.com',phone:'+18765550102'}});
 const c=await prisma.user.upsert({where:{email:'carl@example.com'},update:{},create:{name:'Carl',email:'carl@example.com',phone:'+18765550103'}});
 const circle=await prisma.circle.create({data:{name:'Demo Pardna',hand_amount:BigInt(1000000),currency:'JMD',interval_seconds:604800,start_at:new Date(Date.now()+60000),status:'planned'}});
 const mems=await Promise.all([a,b,c].map((m,i)=>prisma.membership.create({data:{circle_id:circle.id,user_id:m.id,payout_position:i}})));
 for(let i=0;i<mems.length;i++){const dueAt=new Date(new Date(circle.start_at).getTime()+i*circle.interval_seconds*1000);await prisma.round.create({data:{circle_id:circle.id,index_num:i,due_at:dueAt,status:'open'}})}
 console.log({circleId:circle.id, memberIds: mems.map(m=>m.id)});
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
