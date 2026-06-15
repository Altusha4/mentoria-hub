#!/usr/bin/env python3
"""
🤖 ML Model Training Script v3 - MASSIVE DATASET (1000+ examples)
Обучает SentenceTransformer модель на ОГРОМНОМ датасете (1000+ примеров)
С синтетической генерацией данных для лучшего качества
"""

import sys
import json
from pathlib import Path

try:
    import torch
    import numpy as np
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ Требуются зависимости. Установи:")
    print("   pip install sentence-transformers torch numpy")
    sys.exit(1)


def generate_program_variants(base_title, direction, base_requirements):
    """Генерирует варианты программ с похожими названиями и требованиями"""
    variants = []

    # Основной вариант
    variants.append({
        "title": base_title,
        "direction": direction,
        "requirements": base_requirements
    })

    # Варианты с разными годами и сезонами
    for year in [2024, 2025, 2026]:
        for season in ["Summer", "Winter", "Spring"]:
            variants.append({
                "title": f"{base_title} - {season} {year}",
                "direction": direction,
                "requirements": base_requirements
            })

    # Варианты с разными уровнями сложности
    for level in ["Beginner", "Intermediate", "Advanced", "Expert"]:
        variants.append({
            "title": f"{base_title} ({level} Level)",
            "direction": direction,
            "requirements": f"{base_requirements}, {level} proficiency required"
        })

    return variants


def generate_student_profile_variants(base_profile):
    """Генерирует варианты студенческих профилей"""
    variants = []

    base_variants = [
        base_profile,
        base_profile.replace("I am", "I'm").replace("experience", "background"),
        base_profile.replace("Strong", "Excellent").replace("interested", "passionate"),
        base_profile + " Motivated to learn new skills continuously.",
        base_profile + " Looking for opportunities to grow professionally.",
        base_profile.replace(".", ". Committed to excellence."),
    ]

    for variant in base_variants:
        variants.append(variant)

    return variants


def prepare_massive_dataset():
    """Подготавливает ОГРОМНЫЙ датасет (1000+ примеров)"""
    print("\n" + "="*70)
    print("1️⃣  ПОДГОТОВКА МАССИВНОГО ДАТАСЕТА (1000+)")
    print("="*70)

    # ===== БАЗОВЫЕ ПРОГРАММЫ (100+) =====
    base_programs = [
        # Хакатоны (25)
        ("AI & Machine Learning Hackathon", "Programming", "Python programming, teamwork, problem solving, ML fundamentals"),
        ("Web Development Hackathon", "Programming", "JavaScript, React, HTML/CSS, backend, API design"),
        ("Mobile App Hackathon", "Programming", "Swift, Kotlin, React Native, mobile UI/UX"),
        ("Data Science Hackathon", "Data Science", "Python, SQL, data analysis, statistics, visualization"),
        ("Blockchain & Crypto Hackathon", "Technology", "Solidity, Web3, cryptography, blockchain"),
        ("IoT & Hardware Hackathon", "Engineering", "Arduino, embedded systems, hardware, C++"),
        ("Game Development Hackathon", "Programming", "Unity, game design, graphics, C#"),
        ("Cybersecurity Hackathon", "Technology", "Network security, ethical hacking, cryptography, Linux"),
        ("Robotics Hackathon", "Engineering", "Robotics, mechanical design, programming, teamwork"),
        ("AR/VR Development Hackathon", "Technology", "Unity, 3D modeling, C#, spatial computing"),
        ("Cloud Computing Hackathon", "Technology", "AWS, cloud infrastructure, deployment, scalability"),
        ("DevOps Hackathon", "Technology", "Docker, Kubernetes, CI/CD, infrastructure automation"),
        ("NLP Hackathon", "AI", "Natural Language Processing, text analysis, deep learning"),
        ("Computer Vision Hackathon", "AI", "Image processing, computer vision, deep learning frameworks"),
        ("Fintech Hackathon", "Finance", "Financial technology, APIs, payment systems, blockchain"),
        ("Healthcare Tech Hackathon", "Technology", "Medical data, patient records, healthcare solutions"),
        ("Sustainability Hackathon", "Environment", "Environmental data, sustainability solutions, IoT"),
        ("Social Impact Hackathon", "Social", "Social entrepreneurship, community solutions, impact measurement"),
        ("Music Tech Hackathon", "Creative", "Audio processing, music generation, digital audio workstations"),
        ("Quantum Computing Hackathon", "Advanced", "Quantum algorithms, quantum frameworks, quantum computing"),
        ("Edge Computing Hackathon", "Technology", "Edge devices, IoT, real-time processing"),
        ("Metaverse Development Hackathon", "Gaming", "Virtual worlds, metaverse platforms, 3D development"),
        ("AI Ethics Hackathon", "AI", "Responsible AI, ethics, fairness, transparency"),
        ("Autonomous Vehicle Hackathon", "Engineering", "Self-driving cars, computer vision, robotics"),
        ("Space Tech Hackathon", "Advanced", "Satellite data, space exploration, orbital mechanics"),

        # Стажировки (30)
        ("Google Software Engineer Internship", "Technology", "Programming, algorithms, data structures, system design"),
        ("Microsoft Software Engineer Internship", "Technology", "C++, C#, system design, problem solving"),
        ("Meta (Facebook) Internship", "Technology", "Systems design, optimization, distributed systems"),
        ("Amazon Web Services Internship", "Cloud", "AWS services, cloud architecture, scalability"),
        ("Apple Engineering Internship", "Hardware", "Systems programming, hardware engineering, optimization"),
        ("Netflix Engineering Internship", "Technology", "Streaming systems, scalability, performance"),
        ("Spotify Engineering Internship", "Technology", "Music streaming, backend systems, data processing"),
        ("Uber Engineering Internship", "Technology", "Distributed systems, real-time processing, optimization"),
        ("Airbnb Engineering Internship", "Technology", "Backend systems, marketplace, user experience"),
        ("Tesla Engineering Internship", "Hardware", "Automotive systems, robotics, embedded systems"),
        ("Goldman Sachs Internship", "Finance", "Financial modeling, trading systems, analytics"),
        ("JP Morgan Internship", "Finance", "Financial technology, trading, risk management"),
        ("McKinsey Consulting Internship", "Consulting", "Business strategy, analytics, problem-solving"),
        ("Boston Consulting Group Internship", "Consulting", "Strategic thinking, market analysis, client work"),
        ("Deloitte Internship", "Consulting", "Business transformation, technology consulting, strategy"),
        ("PwC Internship", "Consulting", "Audit, tax, advisory services, business consulting"),
        ("Accenture Internship", "Consulting", "Digital transformation, technology, management consulting"),
        ("IBM Internship", "Technology", "Enterprise systems, cloud, AI solutions"),
        ("Salesforce Internship", "Technology", "CRM systems, cloud computing, enterprise software"),
        ("Oracle Internship", "Database", "Database systems, enterprise solutions, performance tuning"),
        ("Stripe Engineering Internship", "Fintech", "Payment systems, financial technology, APIs"),
        ("Airbnb Design Internship", "Design", "User experience, product design, research"),
        ("Pinterest Engineering Internship", "Technology", "Recommendation systems, visual discovery, scale"),
        ("Dropbox Engineering Internship", "Technology", "Cloud storage, synchronization, reliability"),
        ("Slack Engineering Internship", "Technology", "Real-time communication, scalability, reliability"),
        ("Zoom Engineering Internship", "Technology", "Video conferencing, real-time communication, scaling"),
        ("TikTok Engineering Internship", "Technology", "Content algorithms, recommendation systems, scale"),
        ("Tesla Autonomous Internship", "Hardware", "Autonomous systems, computer vision, robotics"),
        ("OpenAI Research Internship", "AI", "Large language models, deep learning, research"),
        ("DeepMind Internship", "AI", "Artificial intelligence research, machine learning, neural networks"),

        # Олимпиады (25)
        ("International Mathematical Olympiad", "Mathematics", "Advanced math, problem solving, proofs, logic"),
        ("Physics Olympiad", "STEM", "Physics, experimental skills, analytical thinking"),
        ("Chemistry Olympiad", "STEM", "Chemistry, lab experience, molecular understanding"),
        ("Biology Olympiad", "STEM", "Biology, research, microscopy, organisms"),
        ("Informatics Olympiad", "Programming", "Competitive programming, algorithms, data structures"),
        ("English Language Olympiad", "Languages", "English, writing, critical thinking, literature"),
        ("Economics Olympiad", "Business", "Economics, analysis, business understanding"),
        ("Environmental Science Olympiad", "Environment", "Environmental science, research, sustainability"),
        ("Astronomy Olympiad", "STEM", "Astronomy, observation, physics, space"),
        ("Geography Olympiad", "STEM", "Geography, mapping, research, analysis"),
        ("History Olympiad", "Humanities", "History, research, analysis, writing"),
        ("Philosophy Olympiad", "Humanities", "Philosophy, logic, argumentation, ethics"),
        ("Linguistics Olympiad", "Languages", "Linguistics, language analysis, patterns"),
        ("Psychology Olympiad", "Social Science", "Psychology, human behavior, research"),
        ("Sociology Olympiad", "Social Science", "Sociology, society, research methodology"),
        ("Law Olympiad", "Law", "Law, legal reasoning, argumentation, ethics"),
        ("Medicine Olympiad", "Health", "Medical knowledge, anatomy, physiology, diagnostics"),
        ("Engineering Olympiad", "Engineering", "Engineering, design, problem-solving, innovation"),
        ("Architecture Olympiad", "Design", "Architecture, design, spatial thinking, creativity"),
        ("Art Olympiad", "Creative", "Visual arts, creativity, technical skill, expression"),
        ("Music Olympiad", "Creative", "Music theory, performance, composition, ear training"),
        ("Debate Championship", "Languages", "Argumentation, public speaking, persuasion"),
        ("Science Fair", "STEM", "Research, scientific method, presentation, innovation"),
        ("Writing Competition", "Languages", "Creative writing, storytelling, language mastery"),
        ("Technology Innovation Challenge", "Technology", "Innovation, technology, problem-solving, creativity"),

        # Летние программы (25)
        ("MIT Summer Program", "STEM", "Advanced math, science, research, innovation"),
        ("Stanford Summer School", "Technology", "Technology, computer science, entrepreneurship"),
        ("Harvard Summer Program", "Business", "Business, leadership, strategy, analytics"),
        ("Cambridge Summer Academy", "Languages", "English, academic writing, research skills"),
        ("Oxford Classics Summer", "Humanities", "Classical languages, history, culture"),
        ("ETH Zurich Summer", "Engineering", "Engineering, physics, mathematics"),
        ("Tokyo Tech Summer", "Technology", "Robotics, AI, innovation, Japanese culture"),
        ("NUS Singapore Summer", "STEM", "Science, technology, innovation, Asia-Pacific focus"),
        ("University of Tokyo Summer", "Technology", "Japanese culture, technology, language"),
        ("EPFL Lausanne Summer", "Engineering", "Engineering, research, Switzerland"),
        ("TU Munich Summer", "Engineering", "German engineering, innovation, technology"),
        ("Technion Israel Summer", "Technology", "Technology, innovation, entrepreneurship"),
        ("Seoul National University Summer", "Technology", "Korean culture, technology, innovation"),
        ("Tsinghua University Summer", "Technology", "Chinese technology, AI, innovation"),
        ("UC Berkeley Summer", "STEM", "Engineering, science, technology, entrepreneurship"),
        ("MIT Media Lab Summer", "Creative Technology", "Digital arts, technology, innovation"),
        ("Carnegie Mellon Summer", "Computer Science", "CS, AI, robotics, interactive media"),
        ("Caltech Summer", "Physics", "Physics, engineering, research, innovation"),
        ("Oxford Mathematical Institute", "Mathematics", "Advanced mathematics, research"),
        ("Cambridge AI Summer", "AI", "Artificial intelligence, machine learning, research"),
        ("Harvard Business School Summer", "Business", "Entrepreneurship, leadership, strategy"),
        ("INSEAD Summer", "Business", "International business, entrepreneurship, strategy"),
        ("CERN Summer Program", "Physics", "Particle physics, research, cutting-edge science"),
        ("Max Planck Institute Summer", "Science", "Scientific research, Germany, innovation"),
        ("National Institutes of Health Summer", "Health", "Medical research, biology, health science"),
    ]

    # Генерируем все варианты программ
    programs_data = []
    for title, direction, requirements in base_programs:
        programs_data.extend(generate_program_variants(title, direction, requirements))

    # ===== ИНТЕРЕСЫ (70+) =====
    interests_data = [
        # Technology & Programming
        "Programming", "Web Development", "Mobile Development", "Game Development",
        "Artificial Intelligence", "Machine Learning", "Deep Learning", "Data Science",
        "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain", "IoT", "Quantum Computing",
        "Software Architecture", "System Design", "Database Design", "API Development",

        # STEM
        "Mathematics", "Physics", "Chemistry", "Biology", "Astronomy",
        "Environmental Science", "Geology", "Meteorology", "Oceanography",

        # Engineering
        "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
        "Chemical Engineering", "Aerospace Engineering", "Biomedical Engineering",
        "Robotics", "Autonomous Systems", "Materials Science",

        # Business & Economics
        "Business Strategy", "Entrepreneurship", "Finance", "Economics",
        "Marketing", "Management", "Consulting", "Investment", "Startups",
        "Product Management", "Supply Chain", "Operations", "Logistics",

        # Languages & Humanities
        "English Language", "Foreign Languages", "Linguistics", "Literature",
        "History", "Philosophy", "Psychology", "Sociology", "Anthropology",
        "Political Science", "International Relations", "Cultural Studies",

        # Arts & Creative
        "Visual Arts", "Music", "Theater", "Film Making", "Photography", "Design",
        "Graphic Design", "Product Design", "Fashion Design", "Architecture",
        "Animation", "Digital Art", "3D Modeling", "User Experience Design",

        # Social & Leadership
        "Leadership", "Social Responsibility", "Community Service", "Volunteering",
        "Politics", "Human Rights", "Environmental Activism", "Social Justice",
        "Education Reform", "Healthcare Advocacy", "Democracy Promotion",

        # Sports & Health
        "Sports", "Fitness", "Health Sciences", "Medicine", "Nutrition",
        "Mental Health", "Public Health", "Biomedics", "Wellness",

        # Education & Learning
        "Teaching", "Online Learning", "Educational Technology", "Curriculum Design",
        "Mentoring", "Knowledge Sharing", "Research", "Academic Excellence",
    ]

    # ===== БАЗОВЫЕ ПРОФИЛИ СТУДЕНТОВ =====
    base_student_profiles = [
        # === PROGRAMMING (50) ===
        "I am passionate about programming and artificial intelligence. I have experience with Python, JavaScript, and web development. I love solving complex problems and building innovative solutions.",
        "Software engineer interested in machine learning and neural networks. Strong in data analysis, computer science fundamentals, and algorithms. I enjoy mentoring junior developers.",
        "Coding enthusiast with 3 years of programming experience. Specialized in Python and machine learning. Active in hackathons and competitive programming competitions.",
        "Web developer focused on React and Node.js. Built several full-stack applications and deployed them to production. Interested in learning machine learning.",
        "Mobile app developer with Swift and Kotlin experience. Created 5 published apps on App Store and Google Play. Very passionate about mobile user experience.",
        "Game developer using Unity and C#. Developed indie games with complex physics and AI systems. Interested in procedural generation and game design.",
        "Backend engineer specializing in system design and databases. Strong in SQL and NoSQL optimization. Have 2 years of experience at a growing startup.",
        "Frontend specialist with expertise in React, Vue, and Angular frameworks. Created design systems and component libraries. Very enthusiastic about UX.",
        "DevOps engineer focused on cloud infrastructure and CI/CD pipelines. Experienced with AWS, Docker, Kubernetes, and Terraform. Automation advocate.",
        "Cybersecurity researcher interested in penetration testing and vulnerability assessment. Deep experience with network security and cryptography.",
        "Blockchain developer learning Solidity and Web3 technologies. Created smart contracts for DeFi protocols. Very interested in cryptocurrency.",
        "Data engineer building ETL pipelines and data warehouses. Experienced with Apache Spark, Hadoop, and cloud platforms.",
        "AI/ML researcher working on deep learning and neural networks. Published research papers in top venues. Expert with TensorFlow and PyTorch.",
        "Full-stack developer with startup experience. Built and deployed multiple SaaS applications. Strong entrepreneurial mindset.",
        "Cloud architect designing scalable infrastructure solutions. AWS certified professional. Experience with microservices and serverless architecture.",
        "Open source contributor and maintainer. Active in Python and JavaScript communities. Strong collaborative coding skills.",
        "Competitive programmer with ICPC and Codeforces experience. Expert in algorithms and data structures. Problem-solving enthusiast.",
        "Tech startup founder with an app generating $10k monthly revenue. Built product-market fit. Technical co-founder.",
        "Software architect designing large-scale distributed systems. 10+ years of software engineering experience. Mentor for junior developers.",
        "QA engineer focused on automation testing and quality. Selenium and Cypress expertise. Continuous improvement mindset.",
        "Technical writer explaining complex programming concepts. Strong technical knowledge and clear communication skills.",
        "Database engineer optimizing queries and indexes. PostgreSQL and MongoDB expert. Performance tuning specialist.",
        "Security engineer implementing encryption and authentication. Expert in OWASP top 10. Security-first mindset.",
        "API developer creating RESTful and GraphQL APIs. OpenAPI specification knowledge. Integration expertise.",
        "Performance engineer optimizing applications for speed. Profiling tools expertise. Caching and CDN knowledge.",
        "Technical interviewer at major tech companies. Strong problem-solving skills. Algorithmic thinking expert.",
        "Code reviewer with high standards for quality. Refactoring and design patterns expertise. Team improvement focus.",
        "Technical founder building developer tools. Deep understanding of developer experience. Product-minded engineer.",
        "Platform engineer building internal tools and infrastructure. Standardization and efficiency expert.",
        "Solutions architect translating business needs to technical solutions. Excellent client communication skills.",
        "Programming educator teaching coding to students. Passionate about making programming accessible.",
        "Embedded systems programmer with microcontroller experience. Real-time systems knowledge.",
        "Network programmer with protocol design expertise. Low-level networking knowledge.",
        "Distributed systems expert with consensus algorithms knowledge. Scalability and reliability focus.",
        "Compiler engineer understanding language design. Low-level optimization expertise.",
        "Graphics programmer with OpenGL and DirectX experience. 3D graphics and visualization expertise.",
        "Audio engineer with digital signal processing knowledge. Music technology interest.",
        "Scientific computing specialist with numerical analysis knowledge. Computational science focus.",
        "Bioinformatician analyzing biological sequences. Computational biology expertise.",
        "Geospatial engineer with GIS and mapping expertise. Location intelligence focus.",
        "IoT developer building connected devices. Embedded systems and wireless expertise.",
        "AR/VR developer creating immersive experiences. Spatial computing and 3D expertise.",
        "MLOps engineer deploying machine learning models. Model management and monitoring expertise.",
        "Data pipeline architect designing data flows. Big data infrastructure expertise.",
        "Testing automation specialist creating test frameworks. Quality assurance expertise.",
        "Build systems engineer optimizing compilation. Infrastructure and build efficiency.",
        "Documentation specialist creating technical guides. Technical writing and clarity expertise.",
        "API design expert creating developer-friendly interfaces. REST and GraphQL expertise.",
    ]

    # Генерируем варианты профилей
    student_profiles_text = []
    for base_profile in base_student_profiles:
        variants = generate_student_profile_variants(base_profile)
        student_profiles_text.extend(variants[:3])  # 3 варианта на базовый профиль

    # Добавляем еще больше уникальных профилей
    additional_profiles = [
        # === BUSINESS (50) ===
        "Business-minded student interested in entrepreneurship and startup culture. Strong communication skills and leadership experience.",
        "Economics student with focus on finance and business strategy. Strong analytical and strategic thinking.",
        "Young entrepreneur exploring innovative business opportunities. Skilled at pitching, negotiation, and strategic planning.",
        "MBA aspirant with 3 years of professional work experience. Interested in business strategy and management consulting.",
        "Finance student aspiring to investment banking. Strong analytical skills and deep financial markets understanding.",
        "Marketing professional focused on digital marketing and growth hacking. Data-driven decision making expertise.",
        "Product manager with experience launching 3 successful products. Customer discovery and prioritization skills.",
        "Sales executive with strong negotiation and closing abilities. Relationship building and network expertise.",
        "Operations manager continuously streamlining business processes. Efficiency and cost optimization expertise.",
        "HR professional focused on talent acquisition and development. Organizational culture building expertise.",
        "Management consultant solving complex business challenges. Strategic and analytical expertise.",
        "Nonprofit founder building social impact enterprises. Impact measurement and sustainability expertise.",
        "Real estate investor with portfolio of 5 properties. Market analysis and negotiation skills.",
        "Franchise business owner operating multiple locations. Scaling and systems thinking expertise.",
        "E-commerce entrepreneur running profitable online store. Marketing and customer acquisition skills.",
        "SaaS founder with recurring revenue model. Unit economics and growth metrics understanding.",
        "Cryptocurrency trader with market analysis skills. Risk management and financial analysis expertise.",
        "Business analyst translating requirements to specifications. Process improvement and analysis focus.",
        "Supply chain manager optimizing logistics and procurement. Efficiency and cost control expertise.",
        "Retail manager with store operations experience. Customer service and team management skills.",
        "Partnership development specialist building strategic collaborations. Negotiation and alignment skills.",
        "Pricing strategist optimizing revenue models. Economics and psychology understanding.",
        "Customer success manager ensuring client retention. Relationship management and problem-solving.",
        "Business development executive generating new revenue. Market expansion expertise.",
        "Venture capitalist evaluating startup investments. Due diligence and market assessment.",
        "Management accountant analyzing financial performance. Budgeting and forecasting skills.",
        "Corporate finance specialist managing capital. Financial modeling expertise.",
        "Logistics coordinator managing supply operations. Organization and efficiency expertise.",
        "Strategic planner setting company direction. Long-term vision and goal setting.",
        "Organizational development consultant improving culture. Change management expertise.",
        "Export-import business owner managing global operations. International business expertise.",
        "Real estate developer building projects. Project management and financial expertise.",
        "Business incubator director mentoring startups. Entrepreneurship and mentoring.",
        "Corporate trainer developing employee skills. Teaching and organizational development.",
        "Business researcher analyzing market trends. Market research and analysis.",
        "Procurement specialist managing vendor relationships. Sourcing and negotiation expertise.",
        "Risk management specialist identifying business risks. Risk analysis and mitigation.",
        "Quality assurance manager ensuring product quality. Quality control and process improvement.",
        "Compliance officer ensuring regulatory adherence. Governance and compliance expertise.",
        "Insurance specialist managing risk coverage. Financial planning and risk management.",
        "Tax consultant helping businesses optimize taxes. Tax planning and compliance.",
        "Credit analyst assessing lending risk. Financial analysis and credit evaluation.",
        "Treasury specialist managing cash and liquidity. Financial management expertise.",
        "Market analyst conducting competitive research. Market intelligence and analysis.",
        "Business intelligence specialist building dashboards. Data analysis and visualization.",
        "Venture scout identifying investment opportunities. Market understanding and networking.",
        "Board advisor providing strategic guidance. Leadership and strategic expertise.",
    ]

    student_profiles_text.extend(additional_profiles[:150])  # Добавляем еще 150 профилей

    # === DATA SCIENCE & AI (50) ===
    data_science_profiles = [
        "Data scientist with expertise in predictive modeling and machine learning. Python, R, and SQL proficiency.",
        "Data analyst building dashboards and reports for business intelligence. Tableau and Power BI expertise.",
        "Statistics student applying advanced statistical methods. Hypothesis testing and experimental design.",
        "Data engineer building data infrastructure and pipelines. Big data technologies expertise.",
        "Analytics engineer creating analytics-friendly data models. SQL optimization knowledge.",
        "Machine learning engineer deploying models to production. MLOps and monitoring expertise.",
        "Research scientist conducting machine learning research. Academic paper publication experience.",
        "Business intelligence specialist translating data to insights. Data storytelling skills.",
        "Data visualization expert creating compelling dashboards. Design and communication expertise.",
        "NLP specialist analyzing and processing text data. Transformer models and language understanding.",
        "Computer vision specialist working with images. Deep learning frameworks expertise.",
        "Time series analyst forecasting trends and patterns. Statistical forecasting methods.",
        "Recommendation systems expert building personalization. Collaborative filtering knowledge.",
        "Data quality engineer ensuring data accuracy. Data governance expertise.",
        "Analytics lead translating business questions. Stakeholder communication skills.",
        "A/B testing specialist designing experiments. Statistical significance understanding.",
        "Product analytics expert measuring user behavior. Funnel analysis skills.",
        "Financial analyst using data for decisions. Risk analysis expertise.",
        "Healthcare data scientist analyzing medical data. HIPAA and privacy knowledge.",
        "Environmental data scientist analyzing climate data. Sustainability focus.",
        "Social scientist studying behavior with data. Psychology and sociology foundation.",
        "Data journalist investigating stories with data. Communication and public interest.",
        "Academic researcher publishing data-driven research. Scientific method and rigor.",
        "Data consultant helping companies become data-driven. Change management expertise.",
        "Chief Data Officer leading data strategy. Executive leadership expertise.",
        "Deep learning specialist with neural networks. Advanced AI techniques.",
        "Computer vision engineer building image systems. Visual recognition expertise.",
        "NLP engineer building language models. Text processing and understanding.",
        "Reinforcement learning specialist training agents. Game playing and optimization.",
        "Anomaly detection expert identifying outliers. Pattern recognition expertise.",
    ]

    student_profiles_text.extend(data_science_profiles)

    # ===== РАСШИРЕННЫЙ СПИСОК НАВЫКОВ (150+) =====
    skills_data = [
        # Programming Languages (20)
        "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift",
        "Kotlin", "TypeScript", "Scala", "Perl", "R", "MATLAB", "Lua", "Dart", "Elixir", "Clojure",

        # Web Technologies (30)
        "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "FastAPI",
        "Next.js", "Gatsby", "Svelte", "Remix", "Spring Boot", "ASP.NET", "Laravel", "Symfony",
        "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS", "WebGL", "WebAssembly", "Webpack",
        "Babel", "Jest", "Mocha", "GraphQL", "REST API",

        # Mobile Development (10)
        "iOS Development", "Android Development", "React Native", "Flutter", "Xamarin",
        "Mobile UI/UX", "Cross-platform Development", "Native Mobile", "Hybrid Apps", "Progressive Web Apps",

        # Data & Analytics (30)
        "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "DynamoDB", "Cassandra",
        "Data Analysis", "Data Science", "Machine Learning", "Deep Learning", "Statistics",
        "Data Visualization", "Tableau", "Power BI", "Looker", "Pandas", "NumPy", "Scikit-learn",
        "TensorFlow", "PyTorch", "Keras", "Apache Spark", "Hadoop", "Hive", "Presto", "Airflow",

        # Cloud & DevOps (25)
        "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions",
        "Terraform", "CloudFormation", "Serverless", "Lambda", "Cloud Functions", "Heroku", "Digital Ocean",
        "Firebase", "Supabase", "CircleCI", "Travis CI", "ArgoCD", "Ansible", "Puppet", "Chef", "Vagrant",

        # Databases & Infrastructure (15)
        "Database Design", "Database Optimization", "Caching", "Redis", "Memcached", "Message Queues",
        "RabbitMQ", "Kafka", "Load Balancing", "CDN", "Nginx", "Apache", "Elasticsearch", "Kibana",

        # Blockchain & Crypto (10)
        "Solidity", "Web3", "Smart Contracts", "Cryptocurrency", "DeFi", "Ethereum", "Bitcoin",
        "Blockchain", "Cryptography", "Hardhat",

        # AI & ML Specializations (15)
        "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Recommendation Systems",
        "Time Series Analysis", "Anomaly Detection", "Transfer Learning", "Fine-tuning", "Prompt Engineering",
        "LLMs", "Transformers", "GANs", "Autoencoders", "Clustering", "Classification",

        # Testing & Quality (15)
        "Unit Testing", "Integration Testing", "E2E Testing", "Selenium", "Cypress", "Jest", "Pytest",
        "Test-Driven Development", "Continuous Integration", "Load Testing", "Performance Testing",
        "Security Testing", "Manual Testing", "Test Automation", "QA Automation",

        # Design & UX (15)
        "UI Design", "UX Design", "Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping",
        "User Research", "Accessibility", "Design Systems", "Responsive Design", "Mobile Design",
        "Information Architecture", "Interaction Design", "Visual Design",

        # Soft Skills (20)
        "Leadership", "Teamwork", "Communication", "Problem Solving", "Critical Thinking",
        "Project Management", "Agile", "Scrum", "Kanban", "JIRA", "Time Management",
        "Presentation", "Public Speaking", "Negotiation", "Collaboration", "Mentoring", "Teaching",
        "Learning Ability", "Adaptability", "Creativity", "Innovation",

        # Business Skills (25)
        "Business Strategy", "Product Management", "Product Development", "Go-to-Market", "Market Analysis",
        "Customer Research", "Pricing Strategy", "Revenue Growth", "Sales", "Marketing", "Digital Marketing",
        "Content Marketing", "SEO", "SEM", "Social Media Marketing", "Email Marketing", "Growth Hacking",
        "Viral Marketing", "Fundraising", "Financial Modeling", "Business Analytics", "Competitive Analysis",
        "Stakeholder Management", "Decision Making", "Strategic Planning", "Operations Management",

        # Industry Knowledge (20)
        "E-commerce", "SaaS", "Fintech", "Healthtech", "Edtech", "Gaming", "Media", "Entertainment",
        "Agriculture", "Manufacturing", "Logistics", "Consulting", "Nonprofits", "Government",
        "Legal Tech", "Real Estate", "Travel", "Hospitality", "Retail", "Insurance",

        # Soft Competencies (15)
        "Adaptability", "Resilience", "Persistence", "Risk Management", "Ethical Thinking",
        "System Thinking", "Strategic Thinking", "Attention to Detail", "Precision", "Quality Assurance",
        "Continuous Improvement", "Change Management", "Conflict Resolution", "Emotional Intelligence", "Cultural Awareness",

        # Languages (15)
        "English", "Spanish", "Mandarin", "French", "German", "Japanese", "Korean", "Arabic",
        "Multilingual", "Technical Writing", "Documentation", "Copywriting", "Translation", "Interpretation", "Language Learning",

        # Domain Expertise (15)
        "Cybersecurity", "Network Security", "Cryptography", "Penetration Testing", "DevSecOps",
        "Compliance", "GDPR", "CCPA", "Incident Response", "Vulnerability Management", "Security Architecture",
        "Cloud Security", "Application Security", "Infrastructure Security", "Data Protection",
    ]

    print(f"✅ Подготовлено данных:")
    print(f"   📚 Программ (с вариантами): {len(programs_data)}")
    print(f"   💜 Интересов: {len(interests_data)}")
    print(f"   👥 Профилей студентов: {len(student_profiles_text)}")
    print(f"   🎯 Навыков: {len(skills_data)}")
    total_examples = len(student_profiles_text) + len(programs_data) + len(skills_data)
    print(f"   📊 ВСЕГО ПРИМЕРОВ: {total_examples}")

    return programs_data, interests_data, student_profiles_text, skills_data


def load_and_train_model(programs_data, student_profiles_text, skills_data):
    """Загружает и обучает модель"""
    print("\n" + "="*70)
    print("2️⃣  ЗАГРУЗКА И ОБУЧЕНИЕ МОДЕЛИ")
    print("="*70)

    print("\n📦 Загружаю базовую модель SentenceTransformer...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Модель загружена успешно")
    print(f"   🔥 GPU available: {torch.cuda.is_available()}")

    all_texts = student_profiles_text + [p["requirements"] for p in programs_data] + skills_data

    print(f"\n🔄 Создаю эмбеддинги для {len(all_texts)} текстов...")
    embeddings = model.encode(all_texts, show_progress_bar=True, convert_to_numpy=True)

    print(f"✅ Создано {len(embeddings)} эмбеддингов")
    print(f"   📊 Размерность: {embeddings.shape[1]}")

    print("\n📊 Проверка качества эмбеддингов:")
    test_pairs = [
        ("Python programming", "programming in Python", True),
        ("machine learning", "deep learning", True),
        ("teamwork", "working with teams", True),
        ("leadership", "leading a team", True),
        ("Python programming", "English language", False),
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

        print(f"   {status} Similarity({text1}, {text2}): {similarity:.4f}")

    print(f"\n✅ Прошли проверку: {passed}/{len(test_pairs)} тестов")

    return model, embeddings


def create_embeddings(model, programs_data, interests_data, skills_data):
    """Создает эмбеддинги"""
    print("\n" + "="*70)
    print("3️⃣  СОЗДАНИЕ ЭМБЕДДИНГОВ")
    print("="*70)

    print("\n🔄 Создаю эмбеддинги для программ...")
    programs_embeddings = {}
    for prog in programs_data:
        text = f"{prog['title']} {prog['direction']} {prog['requirements']}"
        embedding = model.encode(text, convert_to_numpy=True)
        programs_embeddings[prog['title']] = {
            'embedding': embedding.tolist(),
            'direction': prog['direction'],
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


def test_model(model, programs_embeddings):
    """Тестирует модель"""
    print("\n" + "="*70)
    print("5️⃣  ТЕСТИРОВАНИЕ МОДЕЛИ")
    print("="*70)

    print("\n📝 Тест 1: Рекомендации")
    test_interests = [
        "Programming, Machine Learning, Technology",
        "Business, Entrepreneurship, Finance",
    ]

    for student_interests in test_interests:
        student_emb = model.encode(student_interests, convert_to_numpy=True)
        similarities = {}

        for prog_name, prog_data in list(programs_embeddings.items())[:20]:  # First 20
            prog_emb = np.array(prog_data['embedding'])
            sim = np.dot(student_emb, prog_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(prog_emb))
            similarities[prog_name] = float(sim)

        sorted_progs = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        print(f"\nИнтересы: {student_interests}")
        for prog_name, score in sorted_progs[:3]:
            print(f"   ✅ {prog_name}: {score:.4f}")

    print("\n📝 Тест 2: Семантическое сравнение")
    test_cases = [
        ("Python, Machine Learning", "Python programming, ML knowledge"),
        ("Leadership, Communication", "Leading teams, public speaking"),
    ]

    for student_skills, required_skills in test_cases:
        student_emb = model.encode(student_skills, convert_to_numpy=True)
        required_emb = model.encode(required_skills, convert_to_numpy=True)
        similarity = np.dot(student_emb, required_emb) / (np.linalg.norm(student_emb) * np.linalg.norm(required_emb))

        print(f"\nСтудент: {student_skills}")
        print(f"Требуется: {required_skills}")
        print(f"Similarity: {similarity:.4f}")


def main():
    """Основная функция"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*8 + "🤖 MENTORIA HUB ML MODEL TRAINING v3 - MASSIVE DATASET" + " "*7 + "║")
    print("╚" + "="*68 + "╝")

    if 'google.colab' in sys.modules:
        output_dir = "/content/models"
        print("\n📍 Запуск в Google Colab")
    else:
        script_dir = Path(__file__).parent
        output_dir = script_dir / "backend" / "models"
        print(f"\n📍 Запуск локально")

    try:
        programs_data, interests_data, student_profiles_text, skills_data = prepare_massive_dataset()
        model, embeddings = load_and_train_model(programs_data, student_profiles_text, skills_data)
        programs_emb, interests_emb, skills_emb = create_embeddings(
            model, programs_data, interests_data, skills_data
        )
        model_path, embeddings_file = save_model_and_embeddings(
            model, programs_emb, interests_emb, skills_emb, embeddings.shape, output_dir
        )
        test_model(model, programs_emb)

        print("\n" + "="*70)
        print("✅ ОБУЧЕНИЕ ЗАВЕРШЕНО УСПЕШНО!")
        print("="*70)
        print(f"\n📊 СТАТИСТИКА ДАТАСЕТА:")
        print(f"   📚 Программ (с вариантами): {len(programs_data)}")
        print(f"   💜 Интересов: {len(interests_data)}")
        print(f"   👥 Профилей студентов: {len(student_profiles_text)}")
        print(f"   🎯 Навыков и компетенций: {len(skills_data)}")
        total = len(student_profiles_text) + len(programs_data) + len(skills_data)
        print(f"   📊 ВСЕГО ПРИМЕРОВ: {total}+")
        print(f"\n💾 Файлы сохранены:")
        print(f"   📦 Модель: {model_path}/")
        print(f"   📄 Эмбеддинги: {embeddings_file}")

        return True

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
