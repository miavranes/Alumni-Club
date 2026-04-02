import prisma from "../prisma";

async function seedExtendedTheses() {
  console.log("🌱 Dodavanje radova sa proširenim podacima...");

  try {
    const users = await prisma.users.findMany({ take: 5 });
    
    if (users.length === 0) {
      console.log("❌ Nema korisnika u bazi.");
      return;
    }

    const mentors = [
      "Prof. dr Ivan Petrović",
      "Prof. dr Marija Nikolić",
      "Doc. dr Ana Jovanović",
      "Prof. dr Stefan Đorđević",
      "Doc. dr Jelena Marković"
    ];

    const committeeMembers = [
      "Prof. dr Ivan Petrović, Doc. dr Ana Jovanović, Prof. dr Marija Nikolić",
      "Prof. dr Stefan Đorđević, Doc. dr Jelena Marković, Prof. dr Ivan Petrović",
      "Doc. dr Ana Jovanović, Prof. dr Marija Nikolić, Doc. dr Jelena Marković",
      "Prof. dr Marija Nikolić, Prof. dr Stefan Đorđević, Doc. dr Ana Jovanović"
    ];

    const grades = ["A", "A", "A", "B", "B", "B", "B", "C", "C", "D"];
    const topics = [
      "Machine Learning",
      "Cybersecurity",
      "Data Science",
      "Web Development",
      "Mobile Development",
      "Cloud Computing",
      "Artificial Intelligence",
      "Blockchain",
      "IoT",
      "DevOps"
    ];

    const keywordsList = [
      "AI, Machine Learning, Neural Networks",
      "Security, Encryption, Blockchain",
      "Data Mining, Big Data, Analytics",
      "React, Node.js, JavaScript",
      "Android, iOS, Mobile",
      "AWS, Azure, Cloud",
      "Deep Learning, AI, Computer Vision",
      "Blockchain, Cryptocurrency, Smart Contracts",
      "IoT, Sensors, Embedded Systems",
      "CI/CD, Docker, Kubernetes"
    ];

    const abstracts = [
      "Ovaj rad istražuje primenu mašinskog učenja u analizi velikih skupova podataka. Fokus je na razvoju algoritama koji mogu efikasno procesirati i analizirati podatke u realnom vremenu.",
      "Rad se bavi sigurnošću web aplikacija i metodama zaštite od najčešćih napada. Analizirane su moderne tehnike enkripcije i njihova primena u praksi.",
      "Istraživanje obuhvata analizu podataka u sportu koristeći napredne statističke metode. Razvijen je sistem za predviđanje rezultata na osnovu istorijskih podataka.",
      "Rad predstavlja razvoj moderne web aplikacije koristeći React i Node.js. Fokus je na performansama i korisničkom iskustvu.",
      "Istraživanje mobilnih aplikacija za zdravstvo sa naglaskom na privatnost podataka i sigurnost komunikacije između pacijenata i lekara.",
      "Analiza cloud arhitekture i najboljih praksi za skalabilne aplikacije. Upoređene su različite cloud platforme i njihove mogućnosti.",
      "Rad istražuje primenu veštačke inteligencije u obrazovanju, sa fokusom na personalizovano učenje i adaptivne sisteme.",
      "Blockchain tehnologija i njena primena u finansijskom sektoru. Analizirani su pametni ugovori i njihova sigurnost.",
      "Razvoj IoT sistema za pametnu kuću sa naglaskom na energetsku efikasnost i automatizaciju.",
      "DevOps praksa i automatizacija procesa razvoja softvera. Implementacija CI/CD pipeline-a koristeći moderne alate."
    ];

    const thesesData = [];

    for (let i = 0; i < 30; i++) {
      thesesData.push({
        first_name: `Student${i + 1}`,
        last_name: `Prezime${i + 1}`,
        title: `${topics[i % topics.length]} - Istraživanje i implementacija ${i + 1}`,
        type: ["bachelors", "masters", "specialist"][i % 3],
        file_url: `https://example.com/rad${i + 1}.pdf`,
        year: 2020 + (i % 5),
        mentor: mentors[i % mentors.length],
        committee_members: committeeMembers[i % committeeMembers.length],
        grade: grades[i % grades.length],
        keywords: keywordsList[i % keywordsList.length],
        abstract: abstracts[i % abstracts.length],
        title_language: "sr",
        user_id: users[0].id
      });
    }

    const result = await prisma.theses.createMany({
      data: thesesData,
      skipDuplicates: true
    });

    console.log(`✅ Dodato ${result.count} radova sa proširenim podacima`);

    const totalTheses = await prisma.theses.count();
    console.log(`📊 Ukupno radova u bazi: ${totalTheses}`);

  } catch (error) {
    console.error("❌ Greška:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExtendedTheses();
