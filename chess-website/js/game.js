document.addEventListener('DOMContentLoaded', function() {
    var game = new Chess();
    var board = null;
    var whiteSquareGrey = '#a9a9a9';
    var blackSquareGrey = '#696969';

    // localStorage Key
    var LOCAL_STORAGE_KEY = 'chessGameState_v1'; // Added _v1 for potential future structure changes

    // DOM Elements
    var statusDisplay = document.getElementById('statusDisplay');
    var levelDisplay = document.getElementById('levelDisplay');
    var scoreDisplay = document.getElementById('scoreDisplay');
    var moveHistoryDisplay = document.getElementById('moveHistory');
    var newGameBtn = document.getElementById('newGameBtn');
    var undoMoveBtn = document.getElementById('undoMoveBtn');

    // Game State Variables
    var score = 0;
    var moveHistory = []; // Stores SAN strings
    var aiLevel = 1;
    var playerColor = 'w'; // Player is White
    var boardInteractionDisabled = false;

    var aiConfig = [
        { depth: 1, randomness: 0.5 },  // Level 1
        { depth: 1, randomness: 0.4 },  // Level 2
        { depth: 2, randomness: 0.3 },  // Level 3
        { depth: 2, randomness: 0.2 },  // Level 4
        { depth: 3, randomness: 0.2 },  // Level 5
        { depth: 3, randomness: 0.1 },  // Level 6
        { depth: 4, randomness: 0.1 },  // Level 7
        { depth: 4, randomness: 0.05 }, // Level 8
        { depth: 5, randomness: 0.05 }, // Level 9
        { depth: 5, randomness: 0.0 },  // Level 10
        { depth: 6, randomness: 0.0 },  // Level 11
        { depth: 6, randomness: 0.0 }   // Level 12
    ];

    // --- Game State Persistence ---
    function saveGameState() {
        var gameState = {
            level: aiLevel,
            score: score,
            fen: game.fen(),
            moveHistory: moveHistory,
            boardInteractionDisabled: boardInteractionDisabled // Save this state too
        };
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
        } catch (e) {
            console.error("Error saving game state to localStorage:", e);
        }
    }

    function loadGameState() {
        try {
            var savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                var savedState = JSON.parse(savedStateJSON);
                aiLevel = savedState.level || 1;
                score = savedState.score || 0;
                moveHistory = savedState.moveHistory || [];

                if (savedState.fen) {
                    game.load(savedState.fen); // Load FEN into chess.js
                } else {
                    game.reset(); // Should not happen if saved correctly
                }
                board.position(game.fen()); // Update chessboard UI

                boardInteractionDisabled = savedState.boardInteractionDisabled || false;

                updateMoveHistoryDisplay();
                updateStatus(); // This updates displays and checks game over states

                // If game was loaded and is over, ensure interactions are disabled
                // updateStatus() should handle disabling interactions if game.game_over() is true
                // but we explicitly call disableBoardInteractions if boardInteractionDisabled was saved as true
                if (boardInteractionDisabled || game.game_over()) {
                    disableBoardInteractions();
                } else {
                    enableBoardInteractions();
                }
                return true; // State loaded
            }
        } catch (e) {
            console.error("Error loading game state from localStorage:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted state
        }
        return false; // No state loaded or error occurred
    }

    // --- Sound Effects ---
    function playSound(soundType) {
        var sound = document.getElementById(soundType === 'capture' ? 'captureSound' : 'moveSound');
        if (sound) {
            sound.currentTime = 0;
            var playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {}).catch(error => {});
            }
        }
    }

    // --- Score Calculation ---
    function updateScore(moveObject) {
        if (moveObject.color === playerColor && moveObject.captured) {
            var pieceType = moveObject.captured;
            if (pieceType === 'p') score += 10;
            else if (pieceType === 'n' || pieceType === 'b') score += 30;
            else if (pieceType === 'r') score += 50;
            else if (pieceType === 'q') score += 90;
        }
    }

    // --- Move History Display ---
    function updateMoveHistoryDisplay() {
        if (!moveHistoryDisplay) return;
        moveHistoryDisplay.innerHTML = '';
        var ol = document.createElement('ol');
        ol.className = 'list-decimal list-inside';
        moveHistory.forEach(function(move, index) {
            var listItem = document.createElement('li');
            listItem.className = 'p-1 border-b border-gray-200 text-sm';
            if (index % 2 === 0) {
                listItem.textContent = Math.floor(index / 2) + 1 + ". " + move;
            } else {
                var lastItem = ol.lastChild;
                if(lastItem) lastItem.textContent += " ... " + move;
                else listItem.textContent = Math.floor(index / 2) + 1 + ". ... " + move;
            }
            if (index % 2 === 0) ol.appendChild(listItem);
        });
        moveHistoryDisplay.appendChild(ol);
        moveHistoryDisplay.scrollTop = moveHistoryDisplay.scrollHeight;
    }

    // --- Board Interaction Control ---
    function disableBoardInteractions() {
        boardInteractionDisabled = true;
        if(undoMoveBtn) undoMoveBtn.disabled = true;
    }
    function enableBoardInteractions() {
        boardInteractionDisabled = false;
        if(undoMoveBtn) undoMoveBtn.disabled = moveHistory.length < 2 || game.game_over();
    }

    // --- Start New Level ---
    function startNewLevel(isContinuation) { // isContinuation to skip save on initial load if needed
        game.reset();
        board.position('start');
        moveHistory = [];
        updateMoveHistoryDisplay();
        enableBoardInteractions();
        updateStatus();
        if (!isContinuation) { // Avoid saving state when startNewLevel is called during loading sequence
            saveGameState();
        }
    }

    // --- Status Updates & Game End Handling ---
    function updateStatus() {
        var statusText = '';
        var currentTurnColor = (game.turn() === 'b' ? 'Black' : 'White');

        if (game.in_checkmate()) {
            disableBoardInteractions();
            if (game.turn() !== playerColor) {
                statusText = "Checkmate! You Win! Level Cleared!";
                score += 100;
                if (aiLevel < aiConfig.length) {
                    aiLevel++;
                    statusText += " Starting next level shortly...";
                    window.setTimeout(() => startNewLevel(false), 3000);
                } else {
                    statusText += " Congratulations! All levels completed!";
                }
            } else {
                statusText = "Checkmate. AI Wins. Game Over.";
            }
        } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition() || game.insufficient_material()) {
            disableBoardInteractions();
            statusText = "Game Over - Draw.";
            if (game.in_stalemate()) statusText = "Draw by Stalemate.";
            if (game.in_threefold_repetition()) statusText = "Draw by Threefold Repetition.";
            if (game.insufficient_material()) statusText = "Draw by Insufficient Material.";
        } else {
            statusText = currentTurnColor + ' to move.';
            if (game.in_check()) {
                statusText += ', ' + currentTurnColor + ' is in check.';
            }
            // Only enable interactions if game is not over. disableBoardInteractions() might have been called.
            if (!boardInteractionDisabled) { // Check our flag before enabling
                 enableBoardInteractions();
            }
        }

        statusDisplay.textContent = statusText;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = aiLevel + "/" + aiConfig.length;
        if(undoMoveBtn) undoMoveBtn.disabled = moveHistory.length < 2 || boardInteractionDisabled || game.game_over();
    }

    // --- Game Controls ---
    function handleNewGame() {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            console.error("Error removing game state from localStorage:", e);
        }
        aiLevel = 1;
        score = 0;
        boardInteractionDisabled = false; // Explicitly reset
        startNewLevel(false);
        // saveGameState() will be called by startNewLevel
    }

    function handleUndoMove() {
        if (game.game_over() || boardInteractionDisabled || moveHistory.length < 2) return;

        game.undo();
        game.undo();

        if (moveHistory.length >= 2) { // Ensure we can pop
            moveHistory.pop();
            moveHistory.pop();
        }

        board.position(game.fen());
        updateMoveHistoryDisplay();
        enableBoardInteractions();
        updateStatus();
        saveGameState(); // Save state after undo
    }

    // --- Minimax AI ---
    function evaluateBoard(currentBoardState) {
        var totalEvaluation = 0;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                var square = String.fromCharCode('a'.charCodeAt(0) + j) + (i + 1);
                var piece = currentBoardState.get(square);
                if (piece) totalEvaluation += getPieceValue(piece.type, piece.color);
            }
        }
        return totalEvaluation;
    }
    function getPieceValue(pieceType, pieceColor) { /* ... same as before ... */
        var value = 0;
        switch (pieceType) {
            case 'p': value = 1; break; case 'n': value = 3; break;
            case 'b': value = 3; break; case 'r': value = 5; break;
            case 'q': value = 9; break; case 'k': value = 0; break;
        }
        return pieceColor === 'w' ? value : -value;
    }
    function minimaxAlphaBeta(gameInstance, depth, alpha, beta, isMaximizingPlayer) { /* ... same as before ... */
        if (depth === 0 || gameInstance.game_over()) {
            return evaluateBoard(gameInstance);
        }
        var possibleMoves = gameInstance.moves({ verbose: true });
        possibleMoves.sort(() => Math.random() - 0.5);

        if (isMaximizingPlayer) {
            var maxEval = -Infinity;
            for (var move of possibleMoves) {
                gameInstance.move(move.san);
                var evalScore = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, false);
                gameInstance.undo();
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            var minEval = +Infinity;
            for (var move of possibleMoves) {
                gameInstance.move(move.san);
                var evalScore = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, true);
                gameInstance.undo();
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }
    function getBestMove(gameInstance) { /* ... same as before ... */
        var currentLevelIndex = Math.min(aiLevel - 1, aiConfig.length - 1);
        var currentLevelCfg = aiConfig[currentLevelIndex];
        var depth = currentLevelCfg.depth;
        var randomness = currentLevelCfg.randomness;
        var possibleMoves = gameInstance.moves({ verbose: true });

        if (gameInstance.game_over() || possibleMoves.length === 0) return null;
        if (Math.random() < randomness && possibleMoves.length > 0) {
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        var bestMove = null;
        var minEval = +Infinity;
        possibleMoves.sort(() => Math.random() - 0.5);

        for (var move of possibleMoves) {
            gameInstance.move(move.san);
            var evalResult = minimaxAlphaBeta(gameInstance, depth - 1, -Infinity, +Infinity, true);
            gameInstance.undo();
            if (evalResult < minEval) {
                minEval = evalResult;
                bestMove = move;
            }
        }
        return bestMove || possibleMoves[0];
    }

    function makeAIMove() {
        if (game.game_over()) return;
        var bestMoveObject = getBestMove(game);
        if (bestMoveObject) {
            var aiMoveResult = game.move(bestMoveObject.san);
            if (aiMoveResult) {
                moveHistory.push(aiMoveResult.san);
                updateMoveHistoryDisplay();
                playSound(aiMoveResult.flags.includes('c') || aiMoveResult.flags.includes('e') ? 'capture' : 'move');
            }
        }
        board.position(game.fen());
        updateStatus();
        saveGameState(); // Save after AI move
    }

    // --- Chessboard Event Handlers ---
    function removeGreySquares() { /* ... same as before ... */
        document.querySelectorAll('#board .square-55d63').forEach(sq => sq.style.background = '');
    }
    function greySquare(square) { /* ... same as before ... */
        var el = document.querySelector('#board .square-' + square);
        if (el) {
            el.style.background = el.classList.contains('black-3c85d') ? blackSquareGrey : whiteSquareGrey;
        }
    }
    function onDragStart(source, piece, position, orientation) { /* ... same as before, checks boardInteractionDisabled ... */
        if (boardInteractionDisabled || game.game_over() || game.turn() !== playerColor || piece.search(/^b/) !== -1) {
            return false;
        }
    }

    function onDrop(source, target) {
        removeGreySquares();
        var playerMove = game.move({ from: source, to: target, promotion: 'q' });

        if (playerMove === null) return 'snapback';

        moveHistory.push(playerMove.san);
        updateScore(playerMove);
        updateMoveHistoryDisplay();
        playSound(playerMove.flags.includes('c') || playerMove.flags.includes('e') ? 'capture' : 'move');

        if (!game.game_over()) {
            if (game.turn() !== playerColor) {
                disableBoardInteractions();
                updateStatus();
                window.setTimeout(function() {
                    makeAIMove(); // This will call updateStatus and saveGameState
                    // Re-enable interactions only if AI move didn't end the game
                    if (!game.game_over()) {
                       enableBoardInteractions();
                       // saveGameState(); // Already called in makeAIMove
                    } else {
                        saveGameState(); // Save game over state after AI move
                    }
                }, 250);
            } else { // Should not happen if AI is black and player is white
                 updateStatus();
                 saveGameState();
            }
        } else {
             updateStatus(); // Game ended on player's move
             saveGameState();
        }
    }

    function onMouseoverSquare(square, piece) { /* ... same as before, checks boardInteractionDisabled ... */
        if (boardInteractionDisabled || game.turn() !== playerColor) return;
        var moves = game.moves({ square: square, verbose: true });
        if (moves.length === 0) return;
        greySquare(square);
        moves.forEach(m => greySquare(m.to));
    }
    function onMouseoutSquare(square, piece) { /* ... same as before ... */
        removeGreySquares();
    }
    function onSnapEnd() { /* ... same as before ... */
        board.position(game.fen());
    }

    // --- Initialize Board and Game ---
    var config = {
        draggable: true, position: 'start', onDragStart: onDragStart,
        onDrop: onDrop, onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare, onSnapEnd: onSnapEnd,
        pieceTheme: 'assets/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('board', config);

    newGameBtn.addEventListener('click', handleNewGame);
    undoMoveBtn.addEventListener('click', handleUndoMove);

    // Load game or start new
    if (!loadGameState()) {
        handleNewGame(); // This calls startNewLevel, which calls saveGameState
    }
});
