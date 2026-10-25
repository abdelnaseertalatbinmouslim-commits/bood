here(() => {

    'use strict';


    /* =====================================
       أدوات مساعدة
    ===================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];


    /* =====================================
       شاشة المقدمة
    ===================================== */

    const intro = $('#intro');

    const skipIntro = $('#skipIntro');

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


    const closeIntro = () => {

        if (!intro || intro.classList.contains('is-hidden')) {
            return;
        }

        intro.classList.add('is-hidden');

        document.body.classList.remove('intro-active');

        try {

            sessionStorage.setItem(
                'hayatIntroSeen',
                '1'
            );

        } catch (_) {
            // قد تكون sessionStorage غير متاحة في بعض البيئات.
        }

        window.setTimeout(() => {

            if (intro) {
                intro.setAttribute('aria-hidden', 'true');
            }

        }, 850);

    };


    let seenIntro = false;

    try {

        seenIntro =
            sessionStorage.getItem('hayatIntroSeen') === '1';

    } catch (_) {
        // استمرار عمل الموقع حتى لو كانت الذاكرة المؤقتة محظورة.
    }


    if (intro && seenIntro) {

        intro.classList.add('is-hidden');

        intro.setAttribute('aria-hidden', 'true');

    } else if (intro) {

        document.body.classList.add('intro-active');

        if (reduceMotion) {

            window.setTimeout(closeIntro, 500);

        } else {

            window.setTimeout(closeIntro, 4200);

        }

    }


    if (skipIntro) {

        skipIntro.addEventListener(
            'click',
            closeIntro
        );

    }


    if (intro) {

        intro.addEventListener('click', (event) => {

            if (event.target === intro) {
                closeIntro();
            }

        });

    }



    /* =====================================
       قائمة الموبايل
    ===================================== */

    const menuToggle = $('#menuToggle');

    const navLinks = $('#navLinks');


    if (menuToggle && navLinks) {

        menuToggle.addEventListener('click', () => {

            const open =
                menuToggle.getAttribute('aria-expanded') === 'true';


            menuToggle.setAttribute(
                'aria-expanded',
                String(!open)
            );


            menuToggle.setAttribute(
                'aria-label',
                open ? 'فتح القائمة' : 'إغلاق القائمة'
            );


            navLinks.classList.toggle(
                'open',
                !open
            );

        });



        // إغلاق القائمة بعد الضغط على أحد الروابط.

        $$('#navLinks a').forEach(link => {

            link.addEventListener('click', () => {

                navLinks.classList.remove('open');

                menuToggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

                menuToggle.setAttribute(
                    'aria-label',
                    'فتح القائمة'
                );

            });

        });



        // إغلاق القائمة عند الضغط خارجها.

        document.addEventListener('click', (event) => {

            if (
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                navLinks.classList.remove('open');

                menuToggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

                menuToggle.setAttribute(
                    'aria-label',
                    'فتح القائمة'
                );

            }

        });

    }



    /* =====================================
       تأثيرات التمرير
    ===================================== */

    const progressBar = $('#progressBar');

    const header = $('.site-header');

    const floatingBook = $('.floating-book');


    const navAnchors = $$(
        '#navLinks a[href^="#"]:not(.nav-cta)'
    );


    const sections = navAnchors
        .map(a => $(a.getAttribute('href')))
        .filter(Boolean);


    let ticking = false;


    const updateScrollUI = () => {

        const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop;


        const maxScroll =
            document.documentElement.scrollHeight -
            window.innerHeight;



        // شريط التقدم أعلى الموقع.

        if (progressBar) {

            const progress =
                maxScroll > 0
                    ? (scrollTop / maxScroll) * 100
                    : 0;

            progressBar.style.width = `${progress}%`;

        }



        // إضافة ظل للقائمة بعد بدء التمرير.

        if (header) {

            header.classList.toggle(
                'scrolled',
                scrollTop > 12
            );

        }



        // إظهار زر الحجز العائم.

        if (floatingBook) {

            floatingBook.classList.toggle(
                'visible',
                scrollTop > 520
            );

        }



        // تحديد القسم الحالي في القائمة.

        let current = '';


        sections.forEach(section => {

            if (
                scrollTop >= section.offsetTop - 180
            ) {

                current = `#${section.id}`;

            }

        });



        navAnchors.forEach(a => {

            a.classList.toggle(
                'active',
                a.getAttribute('href') === current
            );

        });


        ticking = false;

    };



    window.addEventListener(
        'scroll',
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateScrollUI
                );

                ticking = true;

            }

        },
        {
            passive: true
        }
    );



    updateScrollUI();



    /* =====================================
       ظهور العناصر أثناء التمرير
    ===================================== */

    const revealItems = $$('.reveal');


    if (
        'IntersectionObserver' in window &&
        !reduceMotion
    ) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            'is-visible'
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -35px 0px'
            }
        );


        revealItems.forEach(item => {

            revealObserver.observe(item);

        });

    } else {

        revealItems.forEach(item => {

            item.classList.add('is-visible');

        });

    }



    /* =====================================
       منع اختيار يوم سابق للحجز
    ===================================== */

    const dateInput = $('input[name="date"]');


    if (dateInput) {

        const today = new Date();


        const localToday = new Date(
            today.getTime() -
            today.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 10);


        dateInput.min = localToday;

    }



    /* =====================================
       نموذج الحجز عبر واتساب
    ===================================== */

    /*
       مهم جدًا:

       استبدل الرقم التجريبي برقم واتساب المركز الحقيقي.

       اكتب الرقم بصيغة دولية، بدون علامة + أو مسافات.

       مثال توضيحي لرقم مصري:
       201XXXXXXXXX

       الرقم التالي تجريبي وليس رقم المركز.
    */

    const WHATSAPP_NUMBER = '201000000000';


    const bookingForm = $('#bookingForm');

    const formStatus = $('#formStatus');



    if (bookingForm) {

        bookingForm.addEventListener(
            'submit',
            (event) => {

                event.preventDefault();


                // التحقق من الحقول المطلوبة.

                if (!bookingForm.reportValidity()) {
                    return;
                }



                // منع إرسال الطلب إلى رقم غير حقيقي.

                if (
                    WHATSAPP_NUMBER === '201000000000'
                ) {

                    if (formStatus) {

                        formStatus.textContent =
                            'النموذج جاهز، لكن يجب وضع رقم واتساب المركز الحقيقي داخل ملف js/main.js قبل استقبال الحجوزات.';

                    }

                    return;

                }



                // جمع البيانات من النموذج.

                const data = new FormData(
                    bookingForm
                );


                const name = String(
                    data.get('name') || ''
                ).trim();


                const phone = String(
                    data.get('phone') || ''
                ).trim();


                const service = String(
                    data.get('service') || ''
                ).trim();


                const date = String(
                    data.get('date') || ''
                ).trim();


                const time = String(
                    data.get('time') || ''
                ).trim();


                const notes = String(
                    data.get('notes') || ''
                ).trim();



                // إعداد الرسالة.

                const message = [

                    'السلام عليكم، أود الاستفسار عن حجز موعد في مركز حياة.',

                    `الاسم: ${name}`,

                    `رقم التواصل: ${phone}`,

                    `الخدمة المطلوبة: ${service}`,

                    date
                        ? `اليوم المفضل: ${date}`
                        : '',

                    time
                        ? `الفترة المفضلة: ${time}`
                        : '',

                    notes
                        ? `ملاحظات: ${notes}`
                        : '',

                    'أرجو التواصل معي لتأكيد الموعد المتاح. أعلم أن إرسال الطلب لا يعني تأكيد الحجز.'

                ]
                    .filter(Boolean)
                    .join('\n');



                // تحديث حالة النموذج.

                if (formStatus) {

                    formStatus.textContent =
                        'سيتم فتح واتساب لإرسال طلب الحجز.';

                }



                // فتح واتساب بالرسالة المعدة.

                const whatsappURL =
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


                window.open(
                    whatsappURL,
                    '_blank',
                    'noopener,noreferrer'
                );

            }
        );

    }



    /* =====================================
       السنة الحالية في التذييل
    ===================================== */

    const year = $('#year');


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }



    /* =====================================
       التعامل مع استعادة الصفحة
    ===================================== */

    window.addEventListener(
        'pageshow',
        () => {

            if (
                document.visibilityState === 'visible'
            ) {

                try {

                    if (
                        sessionStorage.getItem(
                            'hayatIntroSeen'
                        ) === '1' &&
                        intro
                    ) {

                        intro.classList.add(
                            'is-hidden'
                        );

                        document.body.classList.remove(
                            'intro-active'
                        );

                    }

                } catch (_) {
                    // لا نوقف الموقع بسبب تعذر الوصول إلى التخزين.
                }

            }

        }
    );


})();
