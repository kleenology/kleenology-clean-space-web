import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      hero: {
        headline: 'Excellence in Every Inch',
        tagline: 'Premium cleaning for modern spaces. Trusted by homes and businesses for quality, reliability, and care.',
        startBooking: 'Start Your Booking',
        learnMore: 'Learn More',
        stats: [
          'Happy Clients',
          'Expert Team',
          'Satisfaction',
        ],
      },
      about: {
        title: 'Why Choose Kleenology?',
        subtitle: 'We are committed to delivering spotless results with a focus on quality, trust, and eco-friendly solutions.',
        features: [
          {
            title: 'Attention to Detail',
            desc: 'We clean every corner, leaving nothing behind.'
          },
          {
            title: 'Trusted Professionals',
            desc: 'Our team is background-checked and highly trained.'
          },
          {
            title: 'Eco-Friendly',
            desc: 'We use safe, green products for your family and the planet.'
          },
          {
            title: 'Transparent Pricing',
            desc: 'No hidden fees. Clear, upfront quotes.'
          }
        ]
      },
      services: {
        title: 'Featured Service',
        subtitle: "Your comfort starts with clean — and we're here to make it effortless",
        description: '',
        mostPopular: 'Most Popular Services',
        popular: [
          'Condo Cleaning',
          'House Cleaning',
          'Deep Cleaning',
          'Carpet Cleaning',
          'Rehabilitation Cleaning',
          'Windows Cleaning',
        ],
        descriptions: {
          'Deep Cleaning': 'Complete top-to-bottom cleaning including baseboards, light fixtures, inside cabinets, and hard-to-reach areas.',
          'House Cleaning': 'Weekly or bi-weekly home maintenance including dusting, vacuuming, mopping, and bathroom sanitization.',
          'Rehabilitation Cleaning': 'Detailed cleaning of ovens, refrigerators, dishwashers, and small appliances inside and out.',
          'Carpet Cleaning': 'Steam cleaning and stain removal for carpets, rugs, and upholstered furniture using professional equipment.',
          'Condo Cleaning': 'Specialized cleaning for condominiums and apartments. Efficient service for modern living spaces.',
          'Windows Cleaning': 'Crystal-clear window cleaning inside and out. Bringing natural light back to your space.',
        },
      },
      showcase: {
        title: 'See the Difference We Make',
        subtitle: 'Experience the transformation through our before & after results and watch our professional team in action.',
        beforeAfter: 'Before & After',
        ourTeam: 'Our Team in Action',
        before: 'Before',
        after: 'After',
        dragToCompare: 'Drag to compare',
        videos: [
          'Deep Cleaning Process',
          'Kitchen Transformation',
          'Office Sanitization',
        ],
      },
      contact: {
        title: 'Contact Us',
        subtitle: 'We are here to help! Reach out to us for bookings, questions, or feedback.',
        whatsapp: 'WhatsApp',
        call: 'Call',
        email: 'Email',
        address: 'Address',
        sendMessage: 'Send Message',
      },
      footer: {
        description: 'Specialized cleaning company committed to delivering spotless results using the latest technologies and eco-friendly products.',
        quickLinks: 'Quick Links',
        home: 'Home',
        about: 'About Us',
        services: 'Services',
        contact: 'Contact',
        servicesTitle: 'Our Services',
        homeCleaningLink: 'Home Cleaning',
        officeCleaningLink: 'Office Cleaning',
        deepCleaningLink: 'Deep Cleaning',
        carpetCleaningLink: 'Carpet Cleaning',
        postConstructionLink: 'Post-Construction Cleaning',
        aboutUs: 'About Us',
        terms: 'Terms & Conditions',
        booking: 'Book Now',
        contactInfo: 'Contact Info',
        copyright: '© {{year}} Kleenology. All rights reserved. | Excellence in every inch.'
      },
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        showcase: 'Showcase',
        contact: 'Contact',
        blog: 'Blog',
        book: 'Book Now',
        call: 'Call',
        whatsapp: 'WhatsApp',
      },
      corporate: {
        title: 'Corporate & Office Cleaning',
        subtitle: 'Professional cleaning solutions for businesses, offices, and commercial spaces.',
        features: [
          { title: 'Flexible Scheduling', desc: 'Before hours, after hours, or weekend services to fit your business needs' },
          { title: 'Trained Professionals', desc: 'Certified staff with corporate experience and security clearances' },
          { title: 'Fully Insured', desc: 'Complete liability coverage and bonded employees for your peace of mind' },
          { title: 'Quality Assurance', desc: 'Regular inspections and satisfaction guarantees for consistent results' },
        ],
        solutionsTitle: 'Complete Corporate Cleaning Solutions',
        solutions: [
          'Daily Office Cleaning',
          'Conference Room Sanitization',
          'Reception Area Maintenance',
          'Restroom Deep Cleaning',
          'Kitchen & Break Room Service',
          'Window & Glass Cleaning',
          'Carpet & Upholstery Care',
          'Post-Construction Cleanup',
          'Medical Office Cleaning',
        ],
        ctaTitle: 'Ready to Enhance Your Workplace Environment?',
        ctaDesc: 'Contact us for a customized cleaning plan that fits your corporate needs and schedule.',
        ctaButton: 'Request Corporate Quote',
      },
      booking: {
        pageTitle: 'Book a Cleaning Service | Kleenology',
        pageDescription: 'Book your professional cleaning service with Kleenology. Fill in the form and we will confirm via WhatsApp.',
        title: 'Book a Cleaning Service',
        subtitle: 'Fill in the form below and we will contact you on WhatsApp to confirm your appointment.',
        services: [
          'Home Cleaning',
          'Deep Cleaning',
          'Office Cleaning',
          'Carpet Cleaning',
          'Condo Cleaning',
          'Windows Cleaning',
          'Rehabilitation Cleaning',
        ],
        form: {
          name: 'Full Name',
          namePlaceholder: 'Enter your full name',
          phone: 'Phone Number',
          phonePlaceholder: '+966 5X XXX XXXX',
          service: 'Service Type',
          servicePlaceholder: 'Select a service',
          date: 'Preferred Date',
          time: 'Preferred Time',
          address: 'Address',
          addressPlaceholder: 'Enter your address',
          notes: 'Additional Notes',
          notesPlaceholder: 'Any special requests or details...',
          submit: 'Send via WhatsApp',
          note: 'We will confirm your booking on WhatsApp as soon as possible.',
        },
      },
      terms: {
        pageTitle: 'Terms and Conditions - Kleenology',
        pageDescription: 'Read our comprehensive terms and conditions for Kleenology cleaning services. Professional cleaning with clear policies.',
        title: 'Terms and Conditions',
        subtitle: 'Please read these terms and conditions carefully before using our cleaning services.',
        introduction: {
          title: 'Introduction',
          points: [
            'Using our services or website constitutes your complete agreement to these terms and conditions.',
            'Any violation gives our company the right to refuse service or collect the full service value.'
          ]
        },
        clientObligations: {
          title: '1. Client Obligations',
          points: [
            'Provide water, electricity, air conditioning and any necessary requirements for work throughout the service period.',
            'Site must be clear of any other workers from the arrival of our team until site handover.',
            'Remove construction debris (such as blocks, cement, sand or paint cans) before team arrival; debris removal is not included in the service.',
            'If the client does not provide basic resources or there are other workers present, work will be performed with minimum capabilities within one day and the team deserves full service value without compensation.'
          ]
        },
        itemSensitivity: {
          title: '2. Item Cleaning Inability or Damage Risk',
          points: [
            'Client must inform the team in writing if there are items that cannot be cleaned or may be damaged; failure to notify makes the client responsible for any damage.',
            'When we are notified of sensitivity and damage occurs due to our negligence, compensation is capped at five times the service value for that item.'
          ]
        },
        appointmentChanges: {
          title: '3. Appointment Postponement or Cancellation',
          points: [
            'Appointment postponement is allowed with a minimum of 48 hours notice, and the company has the right to cancel the appointment or re-evaluate the site upon postponement.',
            'If postponed with less than 48 hours notice, the advance payment is non-refundable.',
            'Failure to receive the team or schedule a new appointment within 30 days is considered cancellation and the team deserves full service value.'
          ]
        },
        serviceDuration: {
          title: '4. Service Duration',
          points: [
            'Service typically takes one working day, and after 24 hours from completion, the client is considered to agree with the results and no complaints are accepted.',
            'Client may request one review within 24 hours of work completion; refusing to receive the team for review is considered waiver of any compensation.',
            'The company has the right to extend work duration if the work requires it.'
          ]
        },
        furnitureMoving: {
          title: '5. Furniture Moving',
          points: [
            'The client must notify the team supervisor in writing if furniture is not suitable for disassembly, reassembly, or moving; the client bears full responsibility for failing to give such notice, including that no compensation is due from the company.',
            'If damage occurs to furniture that was moved and it is proven that the company caused it, the company\'s compensation shall not exceed the total value of the client\'s invoice.',
            'The client acknowledges that the company is not responsible for any effect on furniture not designed to be disassembled and reassembled as it was — for example, ready-made and fixed furniture pieces; if the client wishes otherwise, they must notify the team supervisor in writing.'
          ]
        },
        maintenanceSpareParts: {
          title: '6. Maintenance and Spare Parts',
          points: [
            'The client acknowledges the company\'s entitlement to the repair amount for the specified fault upon its completion, based on the client\'s initial approval of the repair; the appearance of another fault different from the one repaired does not affect this entitlement.',
            'The client acknowledges the company\'s entitlement to the amount of the service provided once the repair is completed, with the company\'s liability released after the team leaves the site.',
            'The client acknowledges that spare parts are covered by the agent\'s (manufacturer\'s) warranty, if any, and that the client may claim against that warranty directly, with the company\'s liability released.'
          ]
        },
        liabilityDisclaimer: {
          title: '7. Liability Disclaimer',
          points: [
            'The team is committed to cleaning visible and general areas only. The cleaning and sanitization service does not include stains and dirt that can only be removed with corrosive materials or special equipment — for example: silicone, rust, paints of all kinds, cement on ceilings or surfaces, chandeliers of all kinds, fire traces, wall washing, floor polishing, or anything else not included in the contract or the provided quotation.',
            'Service pricing is subject to an initial quote and a final quote; the final quote is issued after a team inspects the service location and provides a written quotation, and the company has the right to terminate the contract or amend the final quote with the client\'s approval.',
            'If the client requests that any piece of furniture be moved, the client bears responsibility for any resulting damage.',
            'If any damage is caused by the team without the client requesting the moving or relocation of furniture, the client must prove it, and compensation is capped at three times the value of the provided service.',
            'The client must safeguard personal belongings, valuables, and any other items inside the home, and acknowledges that neither the company nor the team is responsible for the loss of any of them.',
            'Any amounts offered by the company to the client to gain their satisfaction and loyalty are goodwill and conciliation gestures and do not constitute an admission of negligence or of causing damage in any way, unless the company explicitly states so.',
            'All review appointments are booked to verify and inspect reported observations and do not constitute an admission of negligence in any way.',
            'Automated replies do not place any obligation on the company towards the client; if an automated system responds to the client, the client must verify its accuracy through a customer service employee or the company\'s official website.',
            'No condition or obligation is recognized unless stated in the written quotation or on the company\'s official website.'
          ]
        },
        giftCard: {
          title: '8. Gift Card',
          points: [
            'The card cannot be exchanged for cash and its value is non-refundable.',
            'The card is valid for 12 months from the date of purchase, unless otherwise stated.',
            'The card is subject to these terms and conditions and to any additional terms stated upon its issuance.'
          ]
        },
        offersDiscounts: {
          title: '9. Offers and Discounts',
          points: [
            'Offers are available only with online booking, and two offers cannot be combined in one order.',
            'Minimum invoice after discount is 400 SAR; each offer is for a limited time and on specific services.',
            'Maximum cashback is 500 SAR per customer during the offer period, and wallet balance can be used to pay only 50% of invoice value.',
            'Balance cannot be exchanged for cash and cannot be used to pay the full invoice value.',
            'Offers are subject to modification or cancellation at any time, and the company has the right to cancel bookings upon misuse.',
            'Minimum service value is 250 SAR (except hourly cleaning services).'
          ]
        },
        loyaltyProgram: {
          title: '10. Loyalty Program',
          points: [
            'Membership is available to everyone and requires account activation.',
            'Customer receives cashback as a percentage of invoice value; balance is added to wallet and must be used within the specified period for each offer.',
            'Balance can be used to pay only 50% of invoice value, and cannot be converted to cash or used to cover the full invoice.',
            'Customers can receive rewards for referring new customers through the website, provided the referred person completes their first order.',
            'Loyalty program offers may be modified or cancelled at any time, and continued use of the program constitutes acceptance of modifications.'
          ]
        },
        governingLaw: {
          title: '11. Governing Law and Jurisdiction',
          points: [
            'These terms and conditions are governed by and construed in accordance with the laws and regulations of the Kingdom of Saudi Arabia.',
            'The competent courts of the Kingdom of Saudi Arabia have jurisdiction over any disputes arising from the use of Kleenology\'s website or services.',
            'By using Kleenology\'s website or services, users agree to submit to the jurisdiction of the Saudi courts for the resolution of any disputes.'
          ]
        },
        disputeResolution: {
          title: '12. Dispute Resolution',
          points: [
            'In the event of any dispute, users are encouraged to first contact the Kleenology customer service team at +966 53 751 9929 or via email at Contract@kleenology.net to reach an amicable solution.',
            'If a resolution cannot be reached through customer service within a reasonable period, disputes shall be referred in accordance with the governing law set out in the Governing Law and Jurisdiction section.',
            'Kleenology is committed to settling all disputes fairly and in a timely manner.'
          ]
        },
        amendments: {
          title: '13. Amendments to These Terms',
          points: [
            'Kleenology reserves the right to update or amend these terms and conditions at any time. Users will be notified of material changes via the website or through the contact information provided at booking.',
            'Continued use of the website or services after any amendment constitutes acceptance of the updated terms.'
          ]
        },
        contact: {
          title: 'Contact Information',
          description: 'If you have any questions about these terms and conditions, please contact us:',
          phone: 'Phone',
          email: 'Email',
          website: 'Website'
        },
        lastUpdated: 'Last Updated'
      },
    },
  },
  ar: {
    translation: {
      hero: {
        headline: 'الفرق يُرى… في كل لمسة',
        tagline: 'نظافة عميقة، تنظيم مثالي، وتعقيم شامل يعكس احترافية كلينولوجي',
        startBooking: 'ابدأ الحجز',
        learnMore: 'اعرف المزيد',
        stats: [
          'عملاء سعداء',
          'فريق خبراء',
          'رضا تام',
        ],
      },
      about: {
        title: 'لماذا تختار كلينولوجي؟',
        subtitle: 'نحن ملتزمون بتقديم نتائج نظافة مثالية مع التركيز على الجودة والثقة والحلول الصديقة للبيئة.',
        features: [
          {
            title: 'دقة في التنفيذ',
            desc: 'نهتم بأدق التفاصيل لضمان نظافة شاملة ومثالية.'
          },
          {
            title: 'فريق محترف ومعتمد',
            desc: 'خبراء مدربون ومؤهلون بأعلى معايير الجودة والثقة.'
          },
          {
            title: 'منتجات آمنة وطبيعية',
            desc: 'نحافظ على صحة عائلتك والبيئة بمواد تنظيف صديقة وآمنة.'
          },
          {
            title: 'أسعار واضحة ومعلنة',
            desc: 'بدون رسوم مخفية. عروض أسعار واضحة ومحددة مسبقاً.'
          }
        ]
      },
      services: {
        title: 'الخدمة المميزة',
        subtitle: 'راحتك تبدأ بالنظافة — ونحن هنا لجعلها سهلة',
        description: '',
        mostPopular: 'الخدمات الأكثر شعبية',
        popular: [
          'تنظيف الشقق',
          'تنظيف المنازل',
          'تنظيف عميق',
          'تنظيف السجاد',
          'تنظيف تأهيلي',
          'تنظيف النوافذ',
        ],
        descriptions: {
          'تنظيف عميق': 'تنظيف شامل من الأعلى للأسفل يشمل الألواح الجانبية، وحدات الإضاءة، داخل الخزائن، والمناطق صعبة الوصول.',
          'تنظيف المنازل': 'صيانة منزلية أسبوعية أو نصف شهرية تشمل التغبير، الكنس، المسح، وتعقيم الحمامات.',
          'تنظيف تأهيلي': 'تنظيف تفصيلي للأفران، الثلاجات، غسالات الصحون، والأجهزة الصغيرة من الداخل والخارج.',
          'تنظيف السجاد': 'تنظيف بالبخار وإزالة البقع للسجاد، البُسط، والأثاث المنجد باستخدام معدات احترافية.',
          'تنظيف الشقق': 'تنظيف متخصص للشقق السكنية. خدمة فعالة للمساحات العصرية.',
          'تنظيف النوافذ': 'تنظيف النوافذ الصافي من الداخل والخارج. لإعادة الضوء الطبيعي لمساحتك.',
        },
      },
      showcase: {
        title: 'شاهد الفرق الذي نصنعه',
        subtitle: 'اكتشف التحول من خلال نتائجنا قبل وبعد وشاهد فريقنا المحترف أثناء العمل.',
        beforeAfter: 'قبل وبعد',
        ourTeam: 'فريقنا في العمل',
        before: 'قبل',
        after: 'بعد',
        dragToCompare: 'اسحب للمقارنة',
        videos: [
          'عملية التنظيف العميق',
          'تحول المطبخ',
          'تعقيم المكتب',
        ],
      },
      contact: {
        title: 'تواصل معنا',
        subtitle: 'نحن هنا لمساعدتك! تواصل معنا للحجز أو الاستفسارات أو الملاحظات.',
        whatsapp: 'واتساب',
        call: 'اتصال',
        email: 'البريد الإلكتروني',
        address: 'العنوان',
        sendMessage: 'إرسال رسالة',
      },
      footer: {
        description: 'شركة تنظيف متخصصة ملتزمة بتقديم نتائج نظافة مثالية باستخدام أحدث التقنيات والمنتجات الصديقة للبيئة.',
        quickLinks: 'روابط سريعة',
        home: 'الرئيسية',
        about: 'من نحن',
        services: 'الخدمات',
        contact: 'تواصل',
        servicesTitle: 'خدماتنا',
        homeCleaningLink: 'تنظيف المنازل',
        officeCleaningLink: 'تنظيف المكاتب',
        deepCleaningLink: 'تنظيف عميق',
        carpetCleaningLink: 'تنظيف السجاد',
        postConstructionLink: 'تنظيف بعد البناء',
        aboutUs: 'من نحن',
        terms: 'الشروط والأحكام',
        booking: 'احجز الآن',
        contactInfo: 'معلومات التواصل',
        copyright: '© {{year}} كلينولوجي. جميع الحقوق محفوظة. | الفرق يُرى… في كل لمسة.'
      },
      nav: {
        home: 'الرئيسية',
        about: 'من نحن',
        services: 'الخدمات',
        showcase: 'معرض الأعمال',
        contact: 'تواصل',
        blog: 'المدونة',
        book: 'احجز الآن',
        call: 'اتصال',
        whatsapp: 'واتساب',
      },
      corporate: {
        title: 'تنظيف الشركات والمكاتب',
        subtitle: 'حلول تنظيف احترافية للشركات والمكاتب والمساحات التجارية.',
        features: [
          { title: 'جدولة مرنة', desc: 'خدمات قبل الدوام، بعد الدوام، أو في عطلة نهاية الأسبوع لتناسب احتياجات شركتك' },
          { title: 'محترفون مدربون', desc: 'فريق معتمد ذو خبرة في بيئة الشركات وتصاريح أمنية' },
          { title: 'تأمين شامل', desc: 'تغطية تأمينية شاملة مع فريق موثوق لراحة بالك' },
          { title: 'ضمان الجودة', desc: 'فحوصات منتظمة وضمانات رضا للحصول على نتائج ثابتة' },
        ],
        solutionsTitle: 'حلول تنظيف شركات شاملة',
        solutions: [
          'تنظيف مكاتب يومي',
          'تعقيم غرف المؤتمرات',
          'صيانة منطقة الاستقبال',
          'تنظيف عميق للحمامات',
          'خدمة المطبخ وغرفة الراحة',
          'تنظيف النوافذ والزجاج',
          'العناية بالسجاد والمفروشات',
          'تنظيف ما بعد البناء',
          'تنظيف المكاتب الطبية',
        ],
        ctaTitle: 'مستعد لتحسين بيئة مكان عملك؟',
        ctaDesc: 'تواصل معنا للحصول على خطة تنظيف مخصصة تناسب احتياجات وجدولة شركتك.',
        ctaButton: 'طلب عرض سعر للشركات',
      },
      booking: {
        pageTitle: 'احجز خدمة تنظيف | كلينولوجي',
        pageDescription: 'احجز خدمة التنظيف الاحترافية مع كلينولوجي. املأ النموذج وسنتواصل معك عبر واتساب.',
        title: 'صفحة الحجز',
        subtitle: 'املأ النموذج أدناه وسنتواصل معك على واتساب لتأكيد موعدك.',
        services: [
          'تنظيف المنازل',
          'تنظيف عميق',
          'تنظيف المكاتب',
          'تنظيف السجاد',
          'تنظيف الشقق',
          'تنظيف النوافذ',
          'تنظيف تأهيلي',
        ],
        form: {
          name: 'الاسم الكامل',
          namePlaceholder: 'أدخل اسمك الكامل',
          phone: 'رقم الجوال',
          phonePlaceholder: '05X XXX XXXX',
          service: 'نوع الخدمة',
          servicePlaceholder: 'اختر الخدمة',
          date: 'التاريخ المفضل',
          time: 'الوقت المفضل',
          address: 'العنوان',
          addressPlaceholder: 'أدخل عنوانك',
          notes: 'ملاحظات إضافية',
          notesPlaceholder: 'أي طلبات خاصة أو تفاصيل إضافية...',
          submit: 'إرسال عبر واتساب',
          note: 'سنقوم بتأكيد حجزك عبر واتساب في أقرب وقت.',
        },
      },
      terms: {
        pageTitle: 'الشروط والأحكام - كلينولوجي',
        pageDescription: 'اقرأ الشروط والأحكام الشاملة لخدمات التنظيف في كلينولوجي. تنظيف احترافي بسياسات واضحة.',
        title: 'الشروط والأحكام',
        subtitle: 'يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدمات التنظيف الخاصة بنا.',
        introduction: {
          title: 'تمهيد',
          points: [
            'استخدام العميل لخدمات كلينولوجي أو موقعها الإلكتروني يعد موافقة على هذه الشروط والأحكام بالكامل.',
            'أي مخالفة تمنح الشركة الحق في الامتناع عن تقديم الخدمة أو تحصيل قيمتها كاملة.'
          ]
        },
        clientObligations: {
          title: '1. التزامات العميل',
          points: [
            'توفير الماء، الكهرباء، المكيفات وأي احتياجات ضرورية للعمل طوال مدة الخدمة.',
            'خلو الموقع من أي عمالة أخرى منذ وصول فريق العمل وحتى تسليم الموقع.',
            'إزالة مخلفات البناء (مثل البلوك، الإسمنت، الرمل أو علب الطلاء) قبل وصول الفريق؛ نقل المخلفات ليس ضمن الخدمة.',
            'إذا لم يوفر العميل الموارد الأساسية أو كان هناك عمالة أخرى، فسيتم العمل بأقل الإمكانات خلال يوم واحد ويستحق الفريق كامل قيمة الخدمة دون تعويض.'
          ]
        },
        itemSensitivity: {
          title: '2. عدم قابلية الصنف للغسيل أو احتمال التأثر',
          points: [
            'يجب على العميل إبلاغ الفريق كتابياً إذا كانت هناك قطع غير قابلة للتنظيف أو يمكن أن تتضرر؛ عدم الإبلاغ يجعل العميل مسؤولاً عن أي ضرر.',
            'عند إبلاغنا بالحساسية ثم حدوث ضرر بسبب تقصيرنا، يكون التعويض بحد أقصى خمسة أضعاف قيمة الخدمة لذلك العنصر.'
          ]
        },
        appointmentChanges: {
          title: '3. تأجيل أو إلغاء الموعد',
          points: [
            'يسمح بتأجيل الموعد قبل 48 ساعة كحد أدنى، ويحق للشركة إلغاء الموعد أو إعادة تقييم الموقع عند التأجيل.',
            'إذا تم التأجيل قبل أقل من 48 ساعة، فالدفعة المقدمة غير قابلة للاسترداد.',
            'عدم استقبال الفريق أو عدم تحديد موعد جديد خلال 30 يوماً يعتبر إلغاءً ويستحق الفريق كامل قيمة الخدمة.'
          ]
        },
        serviceDuration: {
          title: '4. مدة تقديم الخدمة',
          points: [
            'تستغرق الخدمة عادةً يوم عمل، وبعد مرور 24 ساعة من الانتهاء يعتبر العميل موافقاً على النتيجة ولا تُقبل أي شكاوى.',
            'يمكن للعميل طلب مراجعة واحدة خلال 24 ساعة من انتهاء العمل؛ رفض استقبال الفريق للمراجعة يعتبر تنازلاً عن أي تعويض.',
            'للشركة حق تمديد مدة العمل إذا احتاج العمل ذلك.'
          ]
        },
        furnitureMoving: {
          title: '5. نقل الأثاث',
          points: [
            'يلتزم العميل بإخطار مشرف الفريق كتابةً في حال كان الأثاث غير قابل للفك والتركيب والنقل، ويتحمل المسؤولية كاملة عند عدم إخطاره، ومن ذلك عدم لزوم التعويض على الشركة.',
            'في حال وقع تلف للأثاث الذي تم نقله وثبت أن الشركة هي المتسببة فيه، فإنها تلتزم بالتعويض بما لا يتجاوز إجمالي قيمة الفاتورة للعميل.',
            'يقر العميل بعدم مسؤولية الشركة عن أي تأثر للأثاث غير المصمم للفك وإعادة التركيب كما كان، ومن ذلك على سبيل المثال قطع الأثاث الجاهزة والثابتة، وفي حال رغبة العميل بخلاف ذلك فعليه إخطار مشرف الفريق كتابةً.'
          ]
        },
        maintenanceSpareParts: {
          title: '6. الصيانة وقطع الغيار',
          points: [
            'يقر العميل باستحقاق الشركة لمبلغ الإصلاح للخلل المحدد عند الانتهاء منه بناءً على موافقته على إصلاحه ابتداءً، ولا يمنع من استحقاقها له ظهور خلل آخر مختلف عن الخلل الذي تم إصلاحه.',
            'يقر العميل باستحقاق الشركة لمبلغ الخدمة المقدمة في حال إصلاحها، مع إخلاء مسؤوليتها بعد مغادرة الفريق للموقع.',
            'يقر العميل بأن المعتبر في ضمان قطع الغيار ضمان الوكيل إن وجد، وأن للعميل حق الرجوع عليه، مع إخلاء مسؤولية الشركة.'
          ]
        },
        liabilityDisclaimer: {
          title: '7. إخلاء المسؤولية',
          points: [
            'يلتزم الفريق بتنظيف المناطق الظاهرة والعامة فقط، ولا يدخل ضمن خدمة التنظيف والتعقيم جميع البقع والأوساخ التي لا يمكن إزالتها إلا بمواد حارقة أو معدات خاصة، ومنها على سبيل المثال: السليكون، الصدأ، دهانات البوية بأنواعها، الإسمنت على الأسقف أو الأسطح، والثريا بأنواعها، أثر الحريق، غسل الجدران، جلي الأرض، وأي شيء آخر غير مشمول في العقد أو عرض السعر المقدم.',
            'يخضع تقييم سعر الخدمة المقدمة إلى تسعير أولي وتسعير نهائي، ويكون التسعير النهائي عن طريق إرسال فريق لمعاينة مكان تقديم الخدمة وتحرير عرض سعر مكتوب، وللشركة الحق في فسخ العقد أو التعديل في عرض التسعير النهائي بموافقة العميل.',
            'في حال طلب العميل تحريك أي قطع من الأثاث فإنه يتحمل مسؤولية حدوث أي تلفيات تترتب على ذلك.',
            'في حال حصل أي إتلاف من الفريق دون طلب العميل تحريك أو نقل الأثاث، فعلى العميل إثبات ذلك، ويُعوض بثلاثة أضعاف قيمة الخدمة المقدمة كحد أقصى.',
            'يلتزم العميل بالاحتفاظ بمتعلقاته الشخصية والقطع الثمينة أو أي قطع أخرى داخل المنزل ويقر بعدم تحمل الشركة أو الفريق مسؤولية فقدان أي شيء منها.',
            'جميع المبالغ التي تقدمها الشركة للعميل لكسب رضاه وزيادة ولائه هي من باب الصلح وكسب رضا العميل ولا تعد إقرارًا بالتقصير بالعمل أو التسبب بالضرر بأي وجه من الوجوه ما لم تصرح الشركة بذلك.',
            'جميع المواعيد المحجوزة للمراجعة تكون للتحقق من وجود الملاحظات ومعاينتها ولا تعد إقرارًا بالتقصير بالعمل بأي وجه من الوجوه.',
            'لا يفيد الرد الآلي تحميل الشركة أي التزام اتجاه العميل، وفي حال قام الرد الآلي بالرد على العميل فيلتزم العميل بالتحقق من صحته عن طريق موظف خدمة العملاء أو موقع الشركة الرسمي.',
            'لا يعتد بأي شرط أو التزام لم يرد في عرض السعر المكتوب أو على موقع الشركة الرسمي.'
          ]
        },
        giftCard: {
          title: '8. بطاقة الإهداء',
          points: [
            'لا يمكن استبدال البطاقة نقدًا أو استرجاع قيمتها.',
            'البطاقة صالحة لمدة 12 شهرًا من تاريخ الشراء، ما لم يُذكر خلاف ذلك.',
            'تخضع البطاقة لهذه الشروط والأحكام ولأي شروط إضافية تُذكر عند إصدارها.'
          ]
        },
        offersDiscounts: {
          title: '9. العروض والخصومات',
          points: [
            'العروض متاحة فقط عند الحجز الإلكتروني، ولا يمكن دمج عرضين في طلب واحد.',
            'الحد الأدنى للفاتورة بعد الخصم هو 400 ريال؛ كل عرض لفترة محدودة وعلى خدمات محددة.',
            'الحد الأقصى للكاش باك هو 500 ريال لكل عميل خلال فترة العرض، ويمكن استخدام رصيد المحفظة لدفع 50 % فقط من قيمة الفاتورة.',
            'الرصيد لا يُستبدل نقداً ولا يمكن استخدامه لدفع كامل قيمة الفاتورة.',
            'العروض قابلة للتعديل أو الإلغاء في أي وقت، ويحق للشركة إلغاء الحجز عند إساءة الاستخدام.',
            'الحد الأدنى لقيمة الخدمة 250 ريال (باستثناء خدمات التنظيف بالساعة).'
          ]
        },
        loyaltyProgram: {
          title: '10. برنامج الولاء',
          points: [
            'الاشتراك متاح للجميع ويتطلب تفعيل الحساب.',
            'يحصل العميل على كاش باك كنسبة من قيمة الفاتورة؛ يُضاف الرصيد للمحفظة ويجب استخدامه خلال المدة المحددة لكل عرض.',
            'يمكن استخدام الرصيد لدفع 50 % من قيمة الفاتورة فقط، ولا يمكن تحويل الرصيد إلى نقد أو استخدامه لتغطية كامل الفاتورة.',
            'يمكن للعملاء الحصول على مكافآت عند دعوة عملاء جدد عبر الموقع، بشرط إتمام الشخص المحال لأول طلب له.',
            'العروض الخاصة ببرنامج الولاء قد تُعدل أو تُلغى في أي وقت، واستمرار استخدام البرنامج يعد قبولاً بالتعديلات.'
          ]
        },
        governingLaw: {
          title: '11. القانون الحاكم والاختصاص القضائي',
          points: [
            'تخضع هذه الشروط والأحكام وتُفسَّر وفقًا لأنظمة ولوائح المملكة العربية السعودية.',
            'تختص المحاكم المختصة في المملكة العربية السعودية بالفصل في أي نزاعات تنشأ عن استخدام موقع كلينولوجي أو خدماتها.',
            'باستخدام موقع كلينولوجي أو خدماتها، يوافق العملاء على الخضوع للاختصاص القضائي للمحاكم السعودية لحل أي نزاعات.'
          ]
        },
        disputeResolution: {
          title: '12. حل النزاعات',
          points: [
            'في حال نشوء أي نزاع، يُشجَّع العملاء على التواصل أولًا مع فريق خدمة عملاء كلينولوجي على الرقم +966 53 751 9929 أو عبر البريد الإلكتروني Contract@kleenology.net للتوصل إلى حل ودي.',
            'إذا تعذّر الوصول إلى حل عبر خدمة العملاء في غضون مدة معقولة، تُحال النزاعات وفق القانون الحاكم المنصوص عليه في بند القانون الحاكم والاختصاص القضائي.',
            'تلتزم كلينولوجي بتسوية جميع النزاعات بصورة عادلة وفي الوقت المناسب.'
          ]
        },
        amendments: {
          title: '13. التعديلات على هذه الشروط',
          points: [
            'تحتفظ كلينولوجي بالحق في تحديث هذه الشروط والأحكام أو تعديلها في أي وقت. سيتم إخطار العملاء بالتغييرات الجوهرية عبر الموقع الإلكتروني أو من خلال معلومات الاتصال المقدمة عند الحجز.',
            'يُعدّ استمرار استخدام الموقع أو الخدمات بعد أي تعديل موافقةً على الشروط المحدَّثة.'
          ]
        },
        contact: {
          title: 'معلومات التواصل',
          description: 'إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا:',
          phone: 'الهاتف',
          email: 'البريد الإلكتروني',
          website: 'الموقع الإلكتروني'
        },
        lastUpdated: 'آخر تحديث'
      },
    },
  },
};

console.log('Initializing i18n...');

try {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'ar',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, // This prevents the white screen issue
      },
    })
    .then(() => {
      console.log('i18n initialized successfully');
    })
    .catch((error) => {
      console.error('i18n initialization failed:', error);
    });
} catch (error) {
  console.error('i18n setup error:', error);
}

export default i18n; 