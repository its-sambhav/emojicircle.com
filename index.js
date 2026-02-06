
        (function () {
            const faqSection = document.querySelector('.faq-section');
            if (!faqSection) return;

            const items = Array.from(faqSection.querySelectorAll('[data-faq-item]'));

            const closeItem = (item) => {
                const answer = item.querySelector('.faq-answer');
                const trigger = item.querySelector('.faq-question');
                item.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = '0px';
            };

            const openItem = (item) => {
                const answer = item.querySelector('.faq-answer');
                const trigger = item.querySelector('.faq-question');
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            };

            const closeAll = () => {
                items.forEach(closeItem);
            };

            items.forEach((item) => {
                const button = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = '0px';

                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const isOpen = item.classList.contains('open');
                    closeAll();
                    if (!isOpen) {
                        openItem(item);
                    }
                });
            });

            document.addEventListener('click', (event) => {
                if (!faqSection.contains(event.target)) {
                    closeAll();
                }
            });

            window.addEventListener('resize', () => {
                items.forEach((item) => {
                    if (item.classList.contains('open')) {
                        const answer = item.querySelector('.faq-answer');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                });
            });
        })();
