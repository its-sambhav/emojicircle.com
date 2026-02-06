
    /*
      Emoji Memory Game JavaScript
      - Builds the board based on difficulty
      - Shuffles emojis, handles flips and matches
      - Tracks moves, matches, and timer
    */

    // Emoji pool (at least 18 unique for 6x6)
    const EMOJIS = [
      '🐶','🐱','🦊','🐼','🐵','🐸','🦁','🐯','🐷','🐮','🐨','🐧','🐤','🦄','🐝','🐙','🦋','🌈','🍉','🍓','🍪','⚽','🏀','🎲','🚗','✈️','⛵','🎵','🎮','💎','🌟','🔥','☕','📚','🔑'
    ];

    // Game state
    let cols = 4; // default columns (4x4)
    let boardEl = document.getElementById('board');
    let movesEl = document.getElementById('moves');
    let matchesEl = document.getElementById('matches');
    let totalPairsEl = document.getElementById('totalPairs');
    let timerEl = document.getElementById('timer');
    let difficultySelect = document.getElementById('difficulty');
    let restartBtn = document.getElementById('restart');
    restartBtn.textContent = 'Start';
    restartBtn.title = 'Start game';

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false; // disables input while checking
    let moves = 0;
    let matches = 0;
    let totalPairs = 8;
    let hasStarted = false;

    // Timer
    let timerInterval = null;
    let elapsedSeconds = 0;
    let timerRunning = false;

    // Utility: Fisher-Yates shuffle
    function shuffle(array){
      for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Format time mm:ss
    function formatTime(seconds){
      const m = String(Math.floor(seconds/60)).padStart(2,'0');
      const s = String(seconds%60).padStart(2,'0');
      return `${m}:${s}`;
    }

    // Start timer on first flip
    function startTimer(){
      if(timerRunning) return;
      timerRunning = true; elapsedSeconds = 0; timerEl.textContent = formatTime(0);
      timerInterval = setInterval(()=>{ elapsedSeconds++; timerEl.textContent = formatTime(elapsedSeconds); }, 1000);
    }
    function stopTimer(){ timerRunning = false; clearInterval(timerInterval); }

        function previewDifficulty(nCols){
          cols = nCols || 4;
          document.documentElement.style.setProperty('--cols', cols);

          const totalCards = cols * cols;
          totalPairs = totalCards / 2;
          totalPairsEl.textContent = totalPairs;

          moves = 0; matches = 0;
          movesEl.textContent = moves;
          matchesEl.textContent = matches;

          stopTimer(); elapsedSeconds = 0; timerEl.textContent = '00:00'; timerRunning = false;

          boardEl.innerHTML = '';
          boardEl.classList.add('board-hidden');
          boardEl.classList.remove('locked');
          boardEl.setAttribute('aria-hidden', 'true');
          hasStarted = false;
          restartBtn.textContent = 'Start';
          restartBtn.title = 'Start game';
        }

    // Build the board DOM
    function buildBoard(nCols){
      // Configure CSS variable for columns
      cols = nCols || 4;
      document.documentElement.style.setProperty('--cols', cols);

      const totalCards = cols * cols; // e.g., 4x4 or 6x6
      totalPairs = totalCards / 2;
      totalPairsEl.textContent = totalPairs;

      // Choose random unique emojis
      const pool = shuffle(EMOJIS.slice()).slice(0, totalPairs);
      const cards = shuffle([...pool, ...pool]); // duplicate and shuffle

      // Reset state
      boardEl.innerHTML = '';
      boardEl.classList.remove('locked');
      firstCard = null; secondCard = null; lockBoard = false;
      moves = 0; matches = 0; movesEl.textContent = moves; matchesEl.textContent = matches;
  stopTimer(); elapsedSeconds = 0; timerEl.textContent = '00:00'; timerRunning = false;

      // Create card elements
      cards.forEach((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role','button');
        card.setAttribute('aria-label','Hidden card');
        card.dataset.emoji = emoji;
        card.dataset.index = idx;

        // inner wrapper for 3D flip
        const inner = document.createElement('div'); inner.className = 'inner';

        // back face (face-down)
        const back = document.createElement('div'); back.className = 'face back';
        const pattern = document.createElement('div'); pattern.className = 'pattern'; pattern.textContent = '✨';
        back.appendChild(pattern);

        // front face (face-up)
        const front = document.createElement('div'); front.className = 'face front';
        const emojiSpan = document.createElement('div'); emojiSpan.className = 'emoji'; emojiSpan.textContent = emoji;
        front.appendChild(emojiSpan);

        inner.appendChild(back); inner.appendChild(front);
        card.appendChild(inner);

        // Click handler
        card.addEventListener('click', onCardClick);
        card.addEventListener('touchstart', onCardClick);

        boardEl.appendChild(card);
      });
    }

    // Card click handler
    function onCardClick(e){
      const card = e.currentTarget;
      if(lockBoard) return; // disable while animating
      if(card.classList.contains('flipped') || card.classList.contains('matched')) return;

      // Start timer on first user action
      startTimer();

      // Flip current card
      card.classList.add('flipped');

      if(!firstCard){
        firstCard = card; return;
      }

      if(firstCard === card) return; // same card clicked twice

      secondCard = card;
      lockBoard = true; // prevent more clicks until resolved

      // Increment moves (every time two cards are flipped)
      moves++; movesEl.textContent = moves;

      checkForMatch();
    }

    // Check if flipped cards match
    function checkForMatch(){
      const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
      if(isMatch){
        // Leave them flipped and mark matched
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matches++; matchesEl.textContent = matches;

        // Reset selection
        resetSelection();

        // Check win condition
        if(matches === totalPairs){
          stopTimer();
          setTimeout(()=>{
            // small celebration: highlight all matched cards
            document.querySelectorAll('.card.matched .inner').forEach(n => n.style.transform += ' scale(1)');
            alert(`You won! Moves: ${moves} — Time: ${formatTime(elapsedSeconds)}`);
          }, 350);
        }
      } else {
        // Not a match: flip back after delay
        setTimeout(()=>{
          firstCard.classList.remove('flipped');
          secondCard.classList.remove('flipped');
          resetSelection();
        }, 850);
      }
    }

    function resetSelection(){ firstCard = null; secondCard = null; lockBoard = false; }

    // Restart game
    function restart(){
      const selected = parseInt(difficultySelect.value,10) || 4;
      localStorage.setItem('emoji-memory-difficulty', difficultySelect.value);
      buildBoard(selected);
      boardEl.classList.remove('board-hidden');
      boardEl.setAttribute('aria-hidden', 'false');
      restartBtn.textContent = 'Restart';
      restartBtn.title = 'Restart game';
      hasStarted = true;
    }

    function handleDifficultyChange(){
      const selected = parseInt(difficultySelect.value,10) || 4;
      localStorage.setItem('emoji-memory-difficulty', difficultySelect.value);
      if(hasStarted){
        restart();
      } else {
        previewDifficulty(selected);
      }
    }

    // Event listeners
    restartBtn.addEventListener('click', restart);
    difficultySelect.addEventListener('change', handleDifficultyChange);

    // Initialize on load
    (function init(){
      const saved = localStorage.getItem('emoji-memory-difficulty');
      if(saved) difficultySelect.value = saved;
      previewDifficulty(parseInt(difficultySelect.value,10) || 4);
    })();

    // Accessibility: keyboard support (Enter or Space to flip)
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        const focused = document.activeElement;
        if(focused && focused.classList && focused.classList.contains('card')){
          focused.click();
          e.preventDefault();
        }
      }
    });

    // Delegate focus style for cards so they can be tabbed
    boardEl.addEventListener('keydown', (e)=>{});

    // Make created cards focusable when DOM changes
    const observer = new MutationObserver(()=>{
      document.querySelectorAll('.card').forEach(c => c.setAttribute('tabindex', '0'));
    });
    observer.observe(boardEl, {childList:true});

  