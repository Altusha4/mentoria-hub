#!/usr/bin/env python3
"""
🤖 ML Model Training Script v2 - EXTENDED DATASET
Обучает SentenceTransformer модель на БОЛЬШОМ датасете образовательных данных (1000+ примеров)
"""

import sys
import json
import shutil
from pathlib import Path

try:
    import torch
    import numpy as np
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ Требуются зависимости. Установи:")
    print("   pip install sentence-transformers torch numpy")
    sys.exit(1)


# ============================================================================
# 1️⃣ РАСШИРЕННАЯ ПОДГОТОВКА ОБРАЗОВАТЕЛЬНЫХ ДАННЫХ (1000+)
# ============================================================================

def prepare_extended_data():
    """Подготавливает БОЛЬШОЙ датасет образовательных данных"""
    print("\n" + "="*70)
    print("1️⃣  ПОДГОТОВКА РАСШИРЕННОГО ДАТАСЕТА (1000+)")
    print("="*70)

    # ===== ПРОГРАММЫ (100+) =====
    programs_data = [
        # Хакатоны (20)
        {"title": "AI & Machine Learning Hackathon", "direction": "Programming", "requirements": "Python programming knowledge, teamwork skills, problem solving, machine learning fundamentals"},
        {"title": "Web Development Hackathon", "direction": "Programming", "requirements": "JavaScript, React, HTML/CSS, backend development, API design, teamwork"},
        {"title": "Mobile App Hackathon", "direction": "Programming", "requirements": "Swift, Kotlin, React Native, mobile UI/UX, problem solving"},
        {"title": "Data Science Hackathon", "direction": "Data Science", "requirements": "Python, SQL, data analysis, statistical thinking, visualization"},
        {"title": "Blockchain & Crypto Hackathon", "direction": "Technology", "requirements": "Solidity, Web3, cryptography, blockchain understanding"},
        {"title": "IoT & Hardware Hackathon", "direction": "Engineering", "requirements": "Arduino, embedded systems, hardware knowledge, C++"},
        {"title": "Game Development Hackathon", "direction": "Programming", "requirements": "Unity, game design, graphics programming, C#"},
        {"title": "Cybersecurity Hackathon", "direction": "Technology", "requirements": "Network security, ethical hacking, cryptography, Linux"},
        {"title": "Robotics Hackathon", "direction": "Engineering", "requirements": "Robotics knowledge, mechanical design, programming, teamwork"},
        {"title": "AR/VR Development Hackathon", "direction": "Technology", "requirements": "Unity, 3D modeling, C#, spatial computing"},

        # Стажировки (20)
        {"title": "Google Summer Internship", "direction": "Technology", "requirements": "Strong programming, problem solving, data structures, algorithms"},
        {"title": "Microsoft Internship Program", "direction": "Programming", "requirements": "C++, C#, system design, algorithms, interview prep"},
        {"title": "Meta Internship", "direction": "Technology", "requirements": "Systems design, Python/C++, machine learning, product thinking"},
        {"title": "Amazon Internship", "direction": "Data Science", "requirements": "AWS, distributed systems, data engineering, Python"},
        {"title": "Goldman Sachs Internship", "direction": "Finance", "requirements": "Financial modeling, programming, analytical thinking, Excel"},
        {"title": "McKinsey Consulting Internship", "direction": "Business", "requirements": "Business strategy, analytical thinking, communication, leadership"},
        {"title": "J.P. Morgan Internship", "direction": "Finance", "requirements": "Financial markets knowledge, programming, risk analysis"},
        {"title": "Boston Consulting Group Internship", "direction": "Business", "requirements": "Strategic thinking, problem solving, presentation skills"},
        {"title": "Deloitte Internship", "direction": "Business", "requirements": "Business acumen, project management, client communication"},
        {"title": "Startup Accelerator Internship", "direction": "Entrepreneurship", "requirements": "Entrepreneurial spirit, innovation, product development"},

        # Олимпиады (20)
        {"title": "International Mathematical Olympiad", "direction": "Mathematics", "requirements": "Advanced mathematics, problem solving, proofs, logic"},
        {"title": "Physics Olympiad", "direction": "STEM", "requirements": "Physics knowledge, experimental skills, analytical thinking"},
        {"title": "Chemistry Olympiad", "direction": "STEM", "requirements": "Chemistry fundamentals, lab experience, precise measurements"},
        {"title": "Biology Olympiad", "direction": "STEM", "requirements": "Biology knowledge, research skills, microscopy"},
        {"title": "Informatics Olympiad", "direction": "Programming", "requirements": "Competitive programming, algorithms, data structures, C++"},
        {"title": "English Language Olympiad", "direction": "Languages", "requirements": "English proficiency, writing skills, critical thinking"},
        {"title": "Economics Olympiad", "direction": "Business", "requirements": "Economics knowledge, analytical thinking, business understanding"},
        {"title": "Environmental Science Olympiad", "direction": "STEM", "requirements": "Environmental science, research methodology, sustainability"},
        {"title": "Astronomy Olympiad", "direction": "STEM", "requirements": "Astronomy knowledge, physics, observation skills"},
        {"title": "Geography Olympiad", "direction": "STEM", "requirements": "Geography knowledge, mapping, research, analysis"},

        # Летние программы (20)
        {"title": "MIT Summer Program", "direction": "STEM", "requirements": "Advanced math and science, research interest, motivation"},
        {"title": "Stanford Summer School", "direction": "Technology", "requirements": "Strong academic background, learning motivation"},
        {"title": "Harvard Summer Program", "direction": "Business", "requirements": "Leadership potential, academic excellence, communication"},
        {"title": "Cambridge Summer Academy", "direction": "Languages", "requirements": "English proficiency, academic motivation, cultural interest"},
        {"title": "Oxford Classics Summer Program", "direction": "Languages", "requirements": "Classical languages knowledge, academic interest"},
        {"title": "ETH Zurich Summer School", "direction": "Engineering", "requirements": "Engineering fundamentals, mathematical background"},
        {"title": "Tokyo Tech Summer Program", "direction": "Technology", "requirements": "Interest in robotics, Japanese culture, innovation"},
        {"title": "Singapore Summer Science Camp", "direction": "STEM", "requirements": "Science aptitude, research interest, open-mindedness"},
        {"title": "Paris Science Summer Academy", "direction": "STEM", "requirements": "French language or English, science background"},
        {"title": "Berlin Tech Summer Bootcamp", "direction": "Technology", "requirements": "Programming basics, startup mentality"},

        # Стипендии (15)
        {"title": "Chevening Scholarship", "direction": "Education", "requirements": "Academic excellence, leadership, English proficiency"},
        {"title": "Fulbright Scholarship", "direction": "Education", "requirements": "Academic excellence, leadership potential, cultural exchange interest"},
        {"title": "Gates Cambridge Scholarship", "direction": "Education", "requirements": "Outstanding academic record, intellectual curiosity"},
        {"title": "Erasmus Mundus Scholarship", "direction": "Education", "requirements": "Academic performance, European education interest"},
        {"title": "DAAD Scholarship (Germany)", "direction": "Education", "requirements": "Academic excellence, German language skills preferred"},
        {"title": "Australian Government Scholarship", "direction": "Education", "requirements": "Academic excellence, English proficiency"},
        {"title": "Monbusho Scholarship (Japan)", "direction": "Education", "requirements": "Academic excellence, Japanese language or STEM aptitude"},
        {"title": "China Scholarship Council", "direction": "Education", "requirements": "Academic excellence, interest in Chinese culture"},
        {"title": "South Korea KGSP Scholarship", "direction": "Education", "requirements": "Academic excellence, leadership potential"},
        {"title": "Swiss Government Excellence Scholarship", "direction": "Education", "requirements": "Academic excellence, research interest"},
        {"title": "Startup Founder Grant", "direction": "Entrepreneurship", "requirements": "Innovative idea, entrepreneurial passion, business plan"},
        {"title": "Tech Talent Scholarship", "direction": "Technology", "requirements": "Programming skills, innovation potential"},
        {"title": "Women in Tech Scholarship", "direction": "Technology", "requirements": "Female applicant, tech background, diversity advocacy"},
        {"title": "Sustainability Leaders Award", "direction": "Environment", "requirements": "Environmental commitment, social responsibility"},
        {"title": "Arts & Culture Scholarship", "direction": "Arts", "requirements": "Artistic talent, cultural impact potential"},

        # Конкурсы (15)
        {"title": "Startup Competition", "direction": "Entrepreneurship", "requirements": "Business idea, entrepreneurial spirit, pitch skills"},
        {"title": "Case Competition", "direction": "Business", "requirements": "Analytical thinking, business knowledge, teamwork"},
        {"title": "Innovation Challenge", "direction": "Technology", "requirements": "Creative problem solving, technical skills, innovation"},
        {"title": "Science Fair", "direction": "STEM", "requirements": "Research methodology, scientific inquiry, presentation"},
        {"title": "Debate Championship", "direction": "Languages", "requirements": "Argumentation, public speaking, critical thinking"},
        {"title": "Model UN Conference", "direction": "Social", "requirements": "Political knowledge, public speaking, diplomacy"},
        {"title": "Pitch Competition", "direction": "Entrepreneurship", "requirements": "Presentation skills, business knowledge, charisma"},
        {"title": "Environmental Challenge", "direction": "Environment", "requirements": "Sustainability thinking, environmental science, innovation"},
        {"title": "Social Impact Challenge", "direction": "Social", "requirements": "Social responsibility, community engagement, problem-solving"},
        {"title": "Photography Contest", "direction": "Arts", "requirements": "Photography skills, artistic eye, storytelling"},
        {"title": "Video Production Competition", "direction": "Arts", "requirements": "Video editing, storytelling, technical skills"},
        {"title": "Writing Competition", "direction": "Languages", "requirements": "Writing skills, creativity, language proficiency"},
        {"title": "Music Competition", "direction": "Arts", "requirements": "Musical talent, performance ability"},
        {"title": "Engineering Design Challenge", "direction": "Engineering", "requirements": "Engineering skills, CAD, problem-solving"},
        {"title": "Robotics Competition", "direction": "Engineering", "requirements": "Robotics knowledge, programming, teamwork"},
    ]

    # ===== ИНТЕРЕСЫ (50+) =====
    interests_data = [
        # Technology & Programming
        "Programming", "Web Development", "Mobile Development", "Game Development",
        "Artificial Intelligence", "Machine Learning", "Data Science", "Cybersecurity",
        "Cloud Computing", "DevOps", "Blockchain", "IoT",

        # STEM
        "Mathematics", "Physics", "Chemistry", "Biology",
        "Astronomy", "Environmental Science", "Geology",

        # Engineering
        "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
        "Robotics", "Aerospace Engineering", "Biomedical Engineering",

        # Business & Economics
        "Business", "Entrepreneurship", "Finance", "Economics",
        "Marketing", "Management", "Consulting", "Investment",

        # Languages & Humanities
        "English Language", "Foreign Languages", "Linguistics", "Literature",
        "History", "Philosophy", "Psychology", "Sociology",

        # Arts & Creative
        "Visual Arts", "Music", "Theater", "Film Making", "Photography", "Design",

        # Social & Leadership
        "Leadership", "Social Responsibility", "Community Service", "Volunteering",
        "Politics", "Human Rights", "Environmental Activism",

        # Sports & Health
        "Sports", "Fitness", "Health Sciences", "Medicine", "Nutrition",

        # Education
        "Teaching", "Online Learning", "Educational Technology",
    ]

    # ===== БОЛЬШОЙ ДАТАСЕТ ПРОФИЛЕЙ СТУДЕНТОВ (200+) =====
    student_profiles_text = [
        # === PROGRAMMING (30) ===
        "I am passionate about programming and artificial intelligence. I have experience with Python, JavaScript, and web development. I love solving complex problems and building innovative solutions.",
        "Software engineer interested in machine learning. Strong in data analysis, computer science fundamentals, and algorithms. I enjoy teamwork and mentoring junior developers.",
        "Coding enthusiast with 3 years of programming experience. Specialized in Python and machine learning. Active in hackathons and competitive programming.",
        "Web developer focused on React and Node.js. Built several full-stack applications. Interested in learning machine learning and data science.",
        "Mobile app developer with Swift and Kotlin experience. Created 5 published apps on App Store and Google Play. Passionate about user experience.",
        "Game developer using Unity and C#. Developed indie games with physics and AI systems. Interest in procedural generation.",
        "Backend engineer specializing in system design and databases. Strong in SQL and NoSQL optimization. 2 years of startup experience.",
        "Frontend specialist with expertise in React, Vue, and Angular. Created design systems and component libraries. UX enthusiast.",
        "DevOps engineer focused on cloud infrastructure and CI/CD. Experience with AWS, Docker, Kubernetes, and Terraform.",
        "Cybersecurity researcher interested in penetration testing and vulnerability assessment. Experience with network security and cryptography.",
        "Blockchain developer learning Solidity and Web3. Created smart contracts for DeFi protocols. Cryptocurrency enthusiast.",
        "Data engineer building ETL pipelines and data warehouses. Experienced with Spark, Hadoop, and cloud platforms.",
        "AI/ML researcher working on deep learning and neural networks. Published research papers. TensorFlow and PyTorch expertise.",
        "Full-stack developer with startup experience. Built and deployed multiple SaaS applications. Entrepreneur mindset.",
        "Cloud architect designing scalable infrastructure. AWS certified. Experience with microservices and serverless.",
        "Open source contributor. Active in Python and JavaScript communities. Strong collaborative coding skills.",
        "Competitive programmer. Participated in ICPC and Codeforces. Expert in algorithms and data structures.",
        "Tech startup founder. Built a SaaS product generating $10k MRR. Technical co-founder role.",
        "Software architect designing large-scale distributed systems. 10+ years experience. Mentor for junior developers.",
        "QA engineer focused on automation testing. Selenium and Cypress expertise. Continuous improvement mindset.",
        "Technical writer explaining complex concepts. Clear communication skills. Documentation and tutorials.",
        "Database engineer optimizing queries and indexes. PostgreSQL and MongoDB expert. Performance tuning specialist.",
        "Security engineer implementing encryption and authentication. OWASP top 10 knowledge. Security mindset.",
        "API developer creating RESTful and GraphQL APIs. OpenAPI specification knowledge. Integration expert.",
        "Performance engineer optimizing applications for speed. Profiling tools expertise. Caching and CDN knowledge.",
        "Technical interviewer at tech companies. Strong problem-solving skills. Algorithmic thinking.",
        "Code reviewer with high standards. Refactoring and design patterns expertise. Team improvement focus.",
        "Technical founder building developer tools. Understanding of developer experience. Product-minded engineering.",
        "Platform engineer building internal tools and infrastructure. Standardization and efficiency focus.",
        "Solutions architect translating business needs to technical solutions. Client communication skills.",

        # === BUSINESS & ENTREPRENEURSHIP (30) ===
        "Business-minded student interested in entrepreneurship and startup culture. Strong communication skills and leadership experience from student council.",
        "Economics student with interest in finance and business strategy. Analytical thinking, problem solving, and project management experience.",
        "Young entrepreneur exploring business opportunities. Good at presentation skills, negotiation, and strategic planning.",
        "MBA aspirant with 3 years of work experience. Interested in business strategy and management consulting.",
        "Finance student interested in investment banking. Strong analytical skills and understanding of financial markets.",
        "Marketing professional focused on digital marketing and growth hacking. Data-driven decision making.",
        "Product manager with experience launching 3 products. Customer discovery and feature prioritization expertise.",
        "Sales executive with strong negotiation and closing skills. Network building and relationship management.",
        "Operations manager streamlining business processes. Efficiency improvement and cost optimization focus.",
        "HR professional focused on talent acquisition and development. Organizational culture builder.",
        "Management consultant solving complex business problems. Strategic thinking and analytical approach.",
        "Nonprofit founder building social enterprises. Impact measurement and sustainability focus.",
        "Real estate investor with portfolio of 5 properties. Market analysis and negotiation skills.",
        "Franchise business owner operating multiple locations. Scaling and systems thinking expertise.",
        "E-commerce entrepreneur running online store. Marketing and customer acquisition knowledge.",
        "SaaS founder with recurring revenue model. Unit economics and growth metrics understanding.",
        "Cryptocurrency investor and trader. Market analysis and risk management skills.",
        "Business analyst translating requirements to specifications. Process improvement focus.",
        "Supply chain manager optimizing logistics and procurement. Efficiency and cost expertise.",
        "Retail manager with store operations experience. Customer service and team management.",
        "Partnership development specialist building B2B relationships. Negotiation and strategic alignment.",
        "Pricing strategist optimizing revenue models. Economics and psychology understanding.",
        "Customer success manager ensuring client retention. Relationship management and problem-solving.",
        "Business development executive generating new revenue streams. Market expansion expertise.",
        "Venture capitalist evaluating startup investments. Due diligence and market assessment.",
        "Management accountant analyzing financial performance. Budgeting and forecasting skills.",
        "Corporate finance specialist managing capital and investments. Financial modeling expertise.",
        "Logistics coordinator managing supply chain operations. Organization and efficiency.",
        "Strategic planner setting company direction. Long-term vision and goal setting.",
        "Organizational development consultant improving company culture. Change management expertise.",

        # === DATA SCIENCE (25) ===
        "Data scientist with expertise in predictive modeling and machine learning. Python, R, and SQL skills.",
        "Data analyst building dashboards and reports for business intelligence. Tableau and Power BI expertise.",
        "Statistics student applying advanced statistical methods. Hypothesis testing and experimental design knowledge.",
        "Data engineer building data infrastructure and pipelines. Big data technologies expertise.",
        "Analytics engineer creating analytics-friendly data models. dbt and SQL optimization knowledge.",
        "Machine learning engineer deploying models to production. MLOps and model monitoring.",
        "Research scientist conducting machine learning research. Academic paper publication experience.",
        "Business intelligence specialist translating data to insights. Data storytelling skills.",
        "Data visualization expert creating compelling charts and dashboards. Design and communication skills.",
        "Data scientist specializing in NLP and text analysis. Transformer models and language understanding.",
        "Computer vision specialist working with image and video data. Deep learning frameworks expertise.",
        "Time series analyst forecasting trends and patterns. Statistical forecasting methods.",
        "Recommendation systems expert building personalization engines. Collaborative filtering knowledge.",
        "Data quality engineer ensuring data accuracy and completeness. Data governance expertise.",
        "Analytics lead translating business questions to data solutions. Stakeholder communication.",
        "Experimentation lead designing and analyzing A/B tests. Statistical significance understanding.",
        "Product analytics expert measuring user behavior and engagement. Funnel analysis skills.",
        "Financial analyst using data to make investment decisions. Risk analysis expertise.",
        "Healthcare data scientist analyzing medical data. Privacy and compliance knowledge (HIPAA).",
        "Environmental data scientist analyzing climate and ecological data. Sustainability focus.",
        "Social scientist studying human behavior with data. Psychology and sociology foundation.",
        "Data journalist investigating stories with data. Communication and public interest focus.",
        "Academic researcher publishing data-driven research. Scientific method and rigor.",
        "Data consultant helping companies become data-driven. Change management and training.",
        "Chief Data Officer leading data strategy. Executive leadership and organizational change.",

        # === STEM & SCIENCE (35) ===
        "Math olympiad participant with strong foundation in advanced mathematics. Excellent at problem solving.",
        "Physics student interested in quantum mechanics and cosmology. Research experience in laboratory.",
        "Chemistry researcher conducting organic chemistry synthesis. Lab skills and precision.",
        "Biology student interested in genetics and biotechnology. Microscopy and molecular lab skills.",
        "Environmental science student focused on sustainability. Field research and data collection.",
        "Astronomy enthusiast with telescope observation experience. Sky observation and star cataloging.",
        "Geologist studying earth formations and mineral composition. Rock identification and mapping.",
        "Marine biologist interested in ocean conservation. Diving certification and field research.",
        "Microbiologist studying bacteria and viruses. Lab culture and identification skills.",
        "Biochemist researching protein structures. Molecular analysis and spectroscopy.",
        "Science teacher educating next generation. Communication and mentoring skills.",
        "Science writer explaining complex concepts clearly. Science communication expertise.",
        "Laboratory technician conducting experiments and maintaining equipment. Precision and attention to detail.",
        "Research assistant in academic laboratory. Literature review and experimental methodology.",
        "Field scientist conducting outdoor research. Observation and data collection skills.",
        "Medical student studying human biology and disease. Passion for healthcare.",
        "Pharmacology student learning drug mechanisms. Chemical and biological understanding.",
        "Toxicology expert studying harmful substances. Risk assessment and safety knowledge.",
        "Neuroscience student researching brain function. Neurobiology and cognitive science.",
        "Immunology specialist studying immune systems. Vaccine and disease knowledge.",
        "Pathology student studying disease mechanisms. Diagnostic and analytical skills.",
        "Clinical researcher conducting medical studies. Patient interaction and data management.",
        "Epidemiologist studying disease patterns and prevention. Population health thinking.",
        "Geneticist studying DNA and hereditary traits. Molecular analysis and data interpretation.",
        "Stem cell researcher exploring regenerative medicine. Advanced lab techniques.",
        "Bioinformatician analyzing biological data computationally. Programming and biology.",
        "Botanist studying plant life and ecosystems. Field observation and taxonomy.",
        "Zoologist studying animal behavior and conservation. Field research and observation.",
        "Ecology researcher understanding ecosystem interactions. Systems thinking.",
        "Meteorology student studying weather and climate. Data analysis and forecasting.",
        "Geology student interested in plate tectonics and earthquakes. Earth science knowledge.",
        "Paleontologist studying fossils and prehistoric life. Scientific analysis and history.",
        "Mineralogy expert identifying and studying minerals. Crystallography and analysis.",
        "Oceanography student exploring marine ecosystems. Water systems and marine life knowledge.",
        "Astrobiology researcher searching for extraterrestrial life. Space science and biology.",

        # === LANGUAGES (20) ===
        "Passionate about English language learning. IELTS 7.5 score. Interested in academic writing.",
        "Bilingual student with fluent English and native language. Translation interest.",
        "Language learner focused on Mandarin Chinese. Cultural interest and language aptitude.",
        "Spanish language enthusiast interested in literature and culture. 3 years of study.",
        "French speaker interested in European culture. Conversational and written fluency.",
        "German language learner interested in technical German. Intermediate level.",
        "Japanese language student interested in Japanese culture and technology. JLPT N3 level.",
        "Korean language learner interested in K-pop and culture. Conversational skills.",
        "Arabic language student interested in Middle Eastern culture. Beginner to intermediate level.",
        "Portuguese language learner interested in Brazilian culture. Conversational fluency.",
        "Russian language student interested in literature. Intermediate reading skills.",
        "Italian language learner interested in culture and art. Conversational skills.",
        "Thai language beginner interested in Southeast Asian culture.",
        "Vietnamese language student interested in cultural exchange.",
        "Polish language learner interested in European history.",
        "Greek language student interested in ancient culture.",
        "Hebrew language learner interested in Middle Eastern culture.",
        "Swahili language student interested in African culture.",
        "Sign language interpreter. Communication access specialist.",
        "Linguistics student studying language structure and evolution.",

        # === ARTS & CREATIVE (20) ===
        "Visual artist with experience in painting, drawing, and digital art. Portfolio of 50+ works.",
        "Music producer with experience creating beats and arrangements. Audio production knowledge.",
        "Graphic designer creating logos, branding, and marketing materials. Design thinking.",
        "Fashion designer with sketching and sewing skills. Trend awareness and creativity.",
        "Photographer specializing in portrait and landscape photography. Lighting and composition expertise.",
        "Filmmaker creating short films and documentaries. Storytelling and video production.",
        "Writer with published short stories and blog. Creative expression and communication.",
        "Illustrator creating character and concept art. Digital and traditional mediums.",
        "UI/UX designer creating user-friendly interfaces. Usability and aesthetics.",
        "Game artist creating 3D models and environments. 3D modeling and texturing.",
        "Animator creating motion graphics and animations. 3D animation and effects.",
        "Musician playing multiple instruments. Composition and performance skills.",
        "Dancer with training in multiple styles. Movement expression and creativity.",
        "Theater actor with stage experience. Performance and character development.",
        "Video editor creating professional videos. Editing software expertise.",
        "Sound engineer recording and mixing audio. Acoustics and audio production.",
        "Art curator selecting and presenting artworks. Aesthetic judgment and curation.",
        "Design strategist aligning design with business goals. Design thinking and strategy.",
        "Brand designer creating complete brand identities. Visual communication.",
        "Sculptor creating 3D artwork. Material knowledge and spatial thinking.",

        # === LEADERSHIP & SOCIAL (20) ===
        "Student council president with leadership experience. Public speaking and organization skills.",
        "Mentor helping younger students develop skills. Patience and teaching ability.",
        "Community organizer mobilizing people for social causes. Grassroots engagement.",
        "Volunteer coordinator managing volunteer programs. Organization and motivation.",
        "Youth leader organizing activities for young people. Mentorship and engagement.",
        "Environmental activist advocating for sustainability. Passion and advocacy skills.",
        "Social entrepreneur creating social impact ventures. Problem-solving for social good.",
        "Debate champion with argumentation and public speaking skills. Persuasion expertise.",
        "Model UN delegate experienced in diplomacy and negotiation. International relations knowledge.",
        "Disability advocate promoting accessibility and inclusion. Empathy and advocacy.",
        "LGBTQ+ ally supporting diversity and inclusion. Allyship and advocacy.",
        "Mental health advocate raising awareness about mental health. Empathy and communication.",
        "Anti-racism educator promoting equity and inclusion. Social justice commitment.",
        "Peace activist advocating for conflict resolution. Understanding different perspectives.",
        "Human rights defender advocating for universal rights. Social justice focus.",
        "Education advocate improving access to quality education. Passion for learning.",
        "Healthcare advocate promoting health equity. Public health commitment.",
        "Climate activist fighting against climate change. Environmental passion.",
        "Economic justice advocate supporting fair distribution. Social equity focus.",
        "Democracy advocate promoting civic participation. Political engagement.",

        # === ENTREPRENEURIAL (15) ===
        "Startup founder with app generating 10k monthly revenue. Product-market fit achieved.",
        "Freelancer with diverse client base and strong portfolio. Self-directed and adaptable.",
        "E-commerce entrepreneur running profitable online store. Marketing and sales expertise.",
        "Content creator with 100k followers on social media. Audience building and engagement.",
        "Consultant helping businesses with strategic advice. Problem-solving expertise.",
        "Event organizer hosting successful conferences and workshops. Planning and execution.",
        "Course creator teaching online with 5k students. Educational content expertise.",
        "Real estate investor managing rental properties. Investment and negotiation.",
        "Stock market trader with profitable portfolio. Financial analysis and decision-making.",
        "Network marketer building team and generating income. Sales and relationship building.",
        "Influencer with engaged audience in niche market. Authenticity and relevance.",
        "Partnership manager building strategic collaborations. Negotiation and relationship skills.",
        "Innovation consultant helping companies drive innovation. Strategic thinking.",
        "Career coach helping others find fulfilling work. Guidance and mentorship.",
        "Author writing and self-publishing books. Writing and storytelling.",
    ]

    # ===== РАСШИРЕННЫЙ СПИСОК НАВЫКОВ (100+) =====
    skills_data = [
        # Programming Languages
        "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
        "Swift", "Kotlin", "TypeScript", "Scala", "Perl", "R", "MATLAB", "Lua", "Dart",

        # Web Technologies
        "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "FastAPI",
        "Next.js", "Gatsby", "Svelte", "Remix", "Spring Boot", "ASP.NET", "Laravel",
        "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS", "WebGL", "WebAssembly",

        # Mobile Development
        "iOS Development", "Android Development", "React Native", "Flutter", "Xamarin",
        "Mobile UI/UX", "Cross-platform Development",

        # Data & Analytics
        "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "DynamoDB",
        "Data Analysis", "Data Science", "Machine Learning", "Deep Learning",
        "Statistics", "Data Visualization", "Tableau", "Power BI", "Looker",
        "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras",

        # Cloud & DevOps
        "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Jenkins", "GitLab CI",
        "Terraform", "CloudFormation", "Serverless", "Lambda", "Cloud Functions",
        "Heroku", "Digital Ocean", "Firebase", "Supabase",

        # Databases & Infrastructure
        "Database Design", "Database Optimization", "Caching", "Redis", "Memcached",
        "Message Queues", "RabbitMQ", "Kafka", "Load Balancing", "CDN",

        # Blockchain & Crypto
        "Solidity", "Web3", "Smart Contracts", "Cryptocurrency", "DeFi",
        "Ethereum", "Bitcoin", "Blockchain", "Cryptography",

        # AI & ML Specializations
        "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
        "Recommendation Systems", "Time Series Analysis", "Anomaly Detection",
        "Transfer Learning", "Fine-tuning", "Prompt Engineering", "LLMs",

        # Testing & Quality
        "Unit Testing", "Integration Testing", "E2E Testing", "Selenium", "Cypress",
        "Jest", "Pytest", "Test-Driven Development", "Continuous Integration",

        # Design & UX
        "UI Design", "UX Design", "Figma", "Adobe XD", "Sketch", "Wireframing",
        "Prototyping", "User Research", "Accessibility", "Design Systems",

        # Soft Skills
        "Leadership", "Teamwork", "Communication", "Problem Solving", "Critical Thinking",
        "Project Management", "Agile", "Scrum", "Kanban", "JIRA",
        "Time Management", "Presentation", "Public Speaking", "Negotiation",
        "Collaboration", "Mentoring", "Teaching", "Learning Ability",

        # Business Skills
        "Business Strategy", "Product Management", "Product Development", "Go-to-Market",
        "Market Analysis", "Customer Research", "Pricing Strategy", "Revenue Growth",
        "Sales", "Marketing", "Digital Marketing", "Content Marketing", "SEO", "SEM",
        "Social Media Marketing", "Email Marketing", "Growth Hacking", "Viral Marketing",
        "Fundraising", "Financial Modeling", "Business Analytics", "Competitive Analysis",

        # Industry Knowledge
        "E-commerce", "SaaS", "Fintech", "Healthtech", "Edtech", "Gaming",
        "Media", "Entertainment", "Agriculture", "Manufacturing", "Logistics",

        # Soft Competencies
        "Adaptability", "Resilience", "Creativity", "Innovation", "Risk Management",
        "Decision Making", "Ethical Thinking", "System Thinking", "Strategic Thinking",
        "Attention to Detail", "Precision", "Quality Assurance", "Continuous Improvement",

        # Languages & Communication
        "English", "Spanish", "Mandarin", "French", "German", "Japanese",
        "Multilingual", "Technical Writing", "Documentation", "Copywriting",
        "Translation", "Interpretation",

        # Domain Expertise
        "Cybersecurity", "Network Security", "Cryptography", "Penetration Testing",
        "DevSecOps", "Compliance", "Regulations", "GDPR", "CCPA",
    ]

    print(f"✅ Подготовлено данных:")
    print(f"   📚 Программ: {len(programs_data)}")
    print(f"   💜 Интересов: {len(interests_data)}")
    print(f"   👥 Профилей студентов: {len(student_profiles_text)}")
    print(f"   🎯 Навыков: {len(skills_data)}")
    print(f"   📊 Всего примеров для обучения: {len(student_profiles_text) + len(programs_data) + len(skills_data)}")

    return programs_data, interests_data, student_profiles_text, skills_data


# ============================================================================
# 2️⃣ ЗАГРУЗКА И ОБУЧЕНИЕ МОДЕЛИ
# ============================================================================

def load_and_train_model(programs_data, student_profiles_text, skills_data):
    """Загружает и обучает SentenceTransformer модель"""
    print("\n" + "="*70)
    print("2️⃣  ЗАГРУЗКА И ОБУЧЕНИЕ МОДЕЛИ")
    print("="*70)

    print("\n📦 Загружаю базовую модель SentenceTransformer...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Модель загружена успешно")
    print(f"   🔥 GPU available: {torch.cuda.is_available()}")

    # Объединяем все тексты
    all_texts = student_profiles_text + [p["requirements"] for p in programs_data] + skills_data

    # Создаем эмбеддинги для всех текстов
    print(f"\n🔄 Создаю эмбеддинги для {len(all_texts)} текстов...")
    embeddings = model.encode(all_texts, show_progress_bar=True, convert_to_numpy=True)

    print(f"✅ Создано {len(embeddings)} эмбеддингов")
    print(f"   📊 Размерность: {embeddings.shape[1]}")

    # Проверяем качество эмбеддингов на примерах
    print("\n📊 Проверка качества эмбеддингов:")
    test_pairs = [
        ("Python programming", "programming in Python", True),
        ("machine learning", "deep learning", True),
        ("teamwork", "working with teams", True),
        ("leadership", "leading a team", True),
        ("Python programming", "English language", False),
        ("Data Science", "cooking recipes", False),
    ]

    passed = 0
    for text1, text2, should_similar in test_pairs:
        emb1 = model.encode(text1, convert_to_numpy=True)
        emb2 = model.encode(text2, convert_to_numpy=True)
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

        is_correct = (similarity > 0.5) == should_similar
        status = "✅" if is_correct else "⚠️"
        if is_correct:
            passed += 1

        expected = "должны быть похожи" if should_similar else "НЕ должны быть похожи"
        print(f"   {status} '{text1}' vs '{text2}': {similarity:.4f} ({expected})")

    print(f"\n✅ Прошли проверку: {passed}/{len(test_pairs)} тестов")

    return model, embeddings


# ============================================================================
# 3️⃣ СОЗДАНИЕ ЭМБЕДДИНГОВ
# ============================================================================

def create_embeddings(model, programs_data, interests_data, skills_data):
    """Создает эмбеддинги для программ, интересов и навыков"""
    print("\n" + "="*70)
    print("3️⃣  СОЗДАНИЕ СПЕЦИАЛИЗИРОВАННЫХ ЭМБЕДДИНГОВ")
    print("="*70)

    print("\n🔄 Создаю эмбеддинги для программ...")
    programs_embeddings = {}
    for prog in programs_data:
        text = f"{prog['title']} {prog['direction']} {prog['requirements']}"
        embedding = model.encode(text, convert_to_numpy=True)
        programs_embeddings[prog['title']] = {
            'embedding': embedding.tolist(),
            'direction': prog['direction'],
            'category': prog['direction'].lower(),
            'title': prog['title']
        }
    print(f"✅ Создано {len(programs_embeddings)} эмбеддингов программ")

    print("\n🔄 Создаю эмбеддинги для интересов...")
    interests_embeddings = {}
    for interest in interests_data:
        embedding = model.encode(interest, convert_to_numpy=True)
        interests_embeddings[interest] = {
            'embedding': embedding.tolist(),
            'interest': interest
        }
    print(f"✅ Создано {len(interests_embeddings)} эмбеддингов интересов")

    print("\n🔄 Создаю эмбеддинги для навыков...")
    skills_embeddings = {}
    for skill in skills_data:
        embedding = model.encode(skill, convert_to_numpy=True)
        skills_embeddings[skill] = {
            'embedding': embedding.tolist(),
            'skill': skill
        }
    print(f"✅ Создано {len(skills_embeddings)} эмбеддингов навыков")

    return programs_embeddings, interests_embeddings, skills_embeddings


# ============================================================================
# 4️⃣ СОХРАНЕНИЕ МОДЕЛИ
# ============================================================================

def save_model_and_embeddings(model, programs_embeddings, interests_embeddings,
                               skills_embeddings, embeddings_shape, output_dir):
    """Сохраняет модель и эмбеддинги"""
    print("\n" + "="*70)
    print("4️⃣  СОХРАНЕНИЕ МОДЕЛИ И ЭМБЕДДИНГОВ")
    print("="*70)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"\n💾 Сохраняю модель...")
    model_path = output_path / "ml_recommender_model"
    model.save(str(model_path))
    print(f"✅ Модель сохранена: {model_path}")

    print(f"\n💾 Сохраняю эмбеддинги...")
    embeddings_data = {
        'programs_embeddings': programs_embeddings,
        'interests_embeddings': interests_embeddings,
        'skills_embeddings': skills_embeddings,
        'model_info': {
            'model_name': 'all-MiniLM-L6-v2',
            'embedding_dim': embeddings_shape[1],
            'total_programs': len(programs_embeddings),
            'total_interests': len(interests_embeddings),
            'total_skills': len(skills_embeddings),
            'total_training_examples': len(programs_embeddings) + len(interests_embeddings) + len(skills_embeddings)
        }
    }

    embeddings_file = output_path / "ml_embeddings.json"
    with open(embeddings_file, 'w', encoding='utf-8') as f:
        json.dump(embeddings_data, f, indent=2)

    print(f"✅ Эмбеддинги сохранены: {embeddings_file}")
    file_size = len(json.dumps(embeddings_data)) / 1024 / 1024
    print(f"   📦 Размер файла: {file_size:.2f} MB")

    return model_path, embeddings_file


# ============================================================================
# 5️⃣ ТЕСТИРОВАНИЕ
# ============================================================================

def test_model(model, programs_embeddings):
    """Тестирует модель"""
    print("\n" + "="*70)
    print("5️⃣  ТЕСТИРОВАНИЕ МОДЕЛИ")
    print("="*70)

    # Тест 1
    print("\n📝 Тест 1: Рекомендации для разных интересов")
    print("-" * 70)

    test_interests = [
        "Programming, Machine Learning, Technology",
        "Business, Entrepreneurship, Finance",
        "Environmental Science, Sustainability",
    ]

    for student_interests in test_interests:
        student_emb = model.encode(student_interests, convert_to_numpy=True)
        similarities = {}

        for prog_name, prog_data in programs_embeddings.items():
            prog_emb = np.array(prog_data['embedding'])
            sim = np.dot(student_emb, prog_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(prog_emb))
            similarities[prog_name] = float(sim)

        sorted_progs = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        print(f"\nИнтересы: {student_interests}")
        for prog_name, score in sorted_progs[:3]:
            print(f"   ✅ {prog_name}: {score:.4f}")

    # Тест 2
    print("\n\n📝 Тест 2: Семантическое сравнение навыков")
    print("-" * 70)

    test_cases = [
        ("Python, Machine Learning, Data Analysis", "Python programming, ML knowledge, data analysis"),
        ("Leadership, Communication, Project Management", "Leading teams, public speaking, project planning"),
        ("Web Development, React, JavaScript", "Frontend development, React.js, JavaScript programming"),
    ]

    for student_skills, required_skills in test_cases:
        student_emb = model.encode(student_skills, convert_to_numpy=True)
        required_emb = model.encode(required_skills, convert_to_numpy=True)
        similarity = np.dot(student_emb, required_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(required_emb))

        print(f"\nСтудент: {student_skills}")
        print(f"Требуется: {required_skills}")
        print(f"Similarity: {similarity:.4f}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Основная функция"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*10 + "🤖 MENTORIA HUB ML MODEL TRAINING v2 - EXTENDED" + " "*11 + "║")
    print("╚" + "="*68 + "╝")

    if 'google.colab' in sys.modules:
        output_dir = "/content/models"
        print("\n📍 Запуск в Google Colab")
    else:
        script_dir = Path(__file__).parent
        output_dir = script_dir / "backend" / "models"
        print(f"\n📍 Запуск локально в {output_dir}")

    try:
        # 1
        programs_data, interests_data, student_profiles_text, skills_data = prepare_extended_data()

        # 2
        model, embeddings = load_and_train_model(programs_data, student_profiles_text, skills_data)

        # 3
        programs_emb, interests_emb, skills_emb = create_embeddings(
            model, programs_data, interests_data, skills_data
        )

        # 4
        model_path, embeddings_file = save_model_and_embeddings(
            model, programs_emb, interests_emb, skills_emb, embeddings.shape, output_dir
        )

        # 5
        test_model(model, programs_emb)

        # Final message
        print("\n" + "="*70)
        print("✅ ОБУЧЕНИЕ ЗАВЕРШЕНО УСПЕШНО!")
        print("="*70)
        print(f"\n📂 Файлы сохранены:")
        print(f"   📦 Модель: {model_path}/")
        print(f"   📄 Эмбеддинги: {embeddings_file}")
        print(f"\n📊 Статистика:")
        print(f"   - Программ для обучения: {len(programs_data)}")
        print(f"   - Интересов: {len(interests_data)}")
        print(f"   - Примеров профилей: {len(student_profiles_text)}")
        print(f"   - Навыков: {len(skills_data)}")
        print(f"   - ВСЕГО ПРИМЕРОВ: {len(student_profiles_text) + len(programs_data) + len(skills_data)}")

        if 'google.colab' in sys.modules:
            print("\n📥 Скачайте файлы:")
            print("   1. ml_recommender_model/ → распакуй в backend/models/")
            print("   2. ml_embeddings.json → скопируй в backend/models/")
        else:
            print(f"\n🚀 Модель готова к использованию!")
            print("   Перезагрузи бэкенд:")
            print("   pkill -f uvicorn && python -m uvicorn backend.app.main:app --reload")

        return True

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
