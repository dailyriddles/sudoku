   // Sudoku Game Logic
        const PUZZLES = [
            {
                puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
                solution:"534678912672195348198342567859761423426853791713924856961537284287419635345286179"
            },
            {
                puzzle: "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
                solution:"483921657967345821251876493548132976729564138136798245372689514814253769695417382"
            },
            {
                puzzle: "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
                solution:"245986371169273584837514269976152438318469725452736891391827645723645196584319672"
            }
        ];

        const boardEl = document.getElementById('board');
        const statusEl = document.getElementById('status');
        let current = null;
        let inputs = [];

        function pickPuzzle() {
            current = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
        }

        function buildBoard() {
            boardEl.innerHTML = '';
            inputs = [];
            for (let r = 0; r < 9; r++) {
                const tr = document.createElement('tr');
                const rowInputs = [];
                for (let c = 0; c < 9; c++) {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.inputMode = 'numeric';
                    input.maxLength = 1;
                    input.className = 'cell';
                    input.dataset.r = r;
                    input.dataset.c = c;

                    const ch = current.puzzle[r*9 + c];
                    if (ch !== '.' && ch !== '0') {
                        input.value = ch;
                        input.readOnly = true;
                        input.classList.add('given');
                        input.tabIndex = -1;
                    } else {
                        input.value = '';
                        input.addEventListener('input', onType);
                        input.addEventListener('keydown', onNav);
                        input.addEventListener('focus', () => input.select());
                    }

                    td.appendChild(input);
                    tr.appendChild(td);
                    rowInputs.push(input);
                }
                boardEl.appendChild(tr);
                inputs.push(rowInputs);
            }
            updateConflicts();
            statusEl.textContent = 'New puzzle loaded! Good luck! 🍀';
        }

        function onType(e) {
            const el = e.target;
            el.value = el.value.replace(/[^1-9]/g, '');
            updateConflicts();
        }

        function onNav(e) {
            const r = +e.target.dataset.r, c = +e.target.dataset.c;
            let nr = r, nc = c;
            if (e.key === 'ArrowUp')   { nr = (r + 8) % 9; }
            if (e.key === 'ArrowDown') { nr = (r + 1) % 9; }
            if (e.key === 'ArrowLeft') { nc = (c + 8) % 9; }
            if (e.key === 'ArrowRight'){ nc = (c + 1) % 9; }
            if (nr !== r || nc !== c) {
                e.preventDefault();
                const nxt = inputs[nr][nc];
                if (nxt.readOnly) {
                    const evt = new KeyboardEvent('keydown', {key: e.key});
                    nxt.dispatchEvent(evt);
                } else {
                    nxt.focus();
                }
            }
        }

        function updateConflicts() {
            for (const row of inputs) for (const el of row) el.classList.remove('conflict');

            function markConflicts(cells) {
                const map = new Map();
                cells.forEach((el) => {
                    const v = el.value;
                    if (!v) return;
                    if (!map.has(v)) map.set(v, []);
                    map.get(v).push(el);
                });
                for (const [v, list] of map) {
                    if (list.length > 1) list.forEach(el => el.classList.add('conflict'));
                }
            }

            for (let r = 0; r < 9; r++) markConflicts(inputs[r]);
            for (let c = 0; c < 9; c++) {
                const col = [];
                for (let r = 0; r < 9; r++) col.push(inputs[r][c]);
                markConflicts(col);
            }
            for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
                const box = [];
                for (let r = br*3; r < br*3+3; r++)
                    for (let c = bc*3; c < bc*3+3; c++)
                        box.push(inputs[r][c]);
                markConflicts(box);
            }
        }

        function checkProgress() {
            updateConflicts();
            let ok = true, complete = true;

            for (let i = 0; i < 81; i++) {
                const el = inputs[Math.floor(i/9)][i%9];
                const sol = current.solution[i];
                const val = el.value;
                if (!val) { complete = false; continue; }
                if (val !== sol) ok = false;
            }

            if (!ok) {
                statusEl.textContent = '❌ Some entries are incorrect. Conflicts are highlighted in red.';
            } else if (!complete) {
                statusEl.textContent = '✅ Excellent progress! You\'re on the right track!';
            } else {
                statusEl.textContent = '🎉 Congratulations! You\'ve solved the puzzle perfectly!';
            }
        }
function checkProgress() {
    updateConflicts();
    let ok = true, complete = true;

    // Clear previous wrong markings
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            inputs[r][c].classList.remove('wrong');
        }
    }

    for (let i = 0; i < 81; i++) {
        const el = inputs[Math.floor(i/9)][i%9];
        const sol = current.solution[i];
        const val = el.value;
        
        if (!val) { 
            complete = false; 
            continue; 
        }
        
        if (val !== sol) {
            ok = false;
            // Mark wrong answers in red
            el.classList.add('wrong');
        }
    }

    if (!ok) {
        statusEl.textContent = '❌ Some entries are incorrect. Wrong answers are marked in red.';
    } else if (!complete) {
        statusEl.textContent = '✅ Excellent progress! You\'re on the right track!';
    } else {
        statusEl.textContent = '🎉 Congratulations! You\'ve solved the puzzle perfectly!';
    }
}

        function giveHint() {
            const empties = [];
            for (let i = 0; i < 81; i++) {
                const r = Math.floor(i/9), c = i%9;
                const el = inputs[r][c];
                if (!el.readOnly && !el.value) empties.push(i);
            }
            if (!empties.length) {
                statusEl.textContent = '💡 No empty cells to fill!';
                return;
            }
            const pick = empties[Math.floor(Math.random() * empties.length)];
            const r = Math.floor(pick/9), c = pick%9;
            inputs[r][c].value = current.solution[pick];
            inputs[r][c].focus();
            updateConflicts();
            statusEl.textContent = '💡 Hint added! Keep going!';
        }

        function solve() {
            for (let i = 0; i < 81; i++) {
                const r = Math.floor(i/9), c = i%9;
                const el = inputs[r][c];
                if (!el.readOnly) el.value = current.solution[i];
                el.classList.remove('conflict');
            }
            statusEl.textContent = '✅ Complete solution revealed!';
        }

        function clearEmpties() {
            for (let r = 0; r < 9; r++)
                for (let c = 0; c < 9; c++) {
                    const el = inputs[r][c];
                    if (!el.readOnly) el.value = '';
                    el.classList.remove('conflict');
                }
            statusEl.textContent = '🧹 Board cleared! Original numbers kept.';
        }

        // Smooth scrolling functions
        function scrollToGame() {
            document.getElementById('game').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        function scrollToAbout() {
            document.getElementById('about').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Event listeners
        document.getElementById('btn-new').addEventListener('click', () => { 
            pickPuzzle(); 
            buildBoard(); 
        });
        document.getElementById('btn-check').addEventListener('click', checkProgress);
        document.getElementById('btn-hint').addEventListener('click', giveHint);
        document.getElementById('btn-solve').addEventListener('click', solve);
        document.getElementById('btn-clear').addEventListener('click', clearEmpties);

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            pickPuzzle();
            buildBoard();
        });

        // Also initialize immediately in case DOMContentLoaded already fired
        if (document.readyState === 'loading') {
            // Document still loading, wait for DOMContentLoaded
        } else {
            // Document already loaded, initialize now
            pickPuzzle();
            buildBoard();
        }

        // Add some interactive animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.addEventListener('DOMContentLoaded', () => {
            const animatedElements = document.querySelectorAll('.feature-card, .section-title, .section-subtitle');
            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        });

        // Add ripple effect to buttons
        function createRipple(event) {
            const button = event.currentTarget;
            const circle = document.createElement('span');
            const diameter = Math.max(button.clientWidth, button.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
            circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
            circle.classList.add('ripple');

            const ripple = button.getElementsByClassName('ripple')[0];
            if (ripple) {
                ripple.remove();
            }

            button.appendChild(circle);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const buttons = document.querySelectorAll('.btn, .game-btn');
            buttons.forEach(button => {
                button.addEventListener('click', createRipple);
            });
        });