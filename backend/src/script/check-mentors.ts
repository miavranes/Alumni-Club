import prisma from "../prisma";

async function checkMentors() {
  const total = await prisma.theses.count();
  const withMentor = await prisma.theses.count({
    where: {
      mentor: { not: null }
    }
  });
  
  console.log(`Ukupno radova: ${total}`);
  console.log(`Radova sa mentorom: ${withMentor}`);
  
  if (withMentor > 0) {
    const mentorStats = await prisma.theses.groupBy({
      by: ['mentor'],
      _count: true,
      where: {
        mentor: { not: null }
      }
    });
    
    console.log("\nStatistika mentora:");
    mentorStats.forEach(stat => {
      console.log(`${stat.mentor}: ${stat._count} radova`);
    });
  }
  
  await prisma.$disconnect();
}

checkMentors();
