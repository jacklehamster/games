const Keyboard = function() {
  const KEY_LEFT = 37;
  const KEY_RIGHT = 39;
  const KEY_UP = 38;
  const KEY_W = 87;
  const KEY_DOWN = 40;
  const KEY_S = 83;
  const KEY_A = 65;
  const KEY_D = 68;
  const KEY_Q = 81;
  const KEY_E = 69;
  const KEY_ENTER = 13;
  const KEY_SPACE = 32;
  const KEY_ESCAPE = 27;
  const KEY_P = 80;
  const keyboard = [];
  let keysMove = true;
  let move = {
  	dx: 0,
  	dy: 0,
  };
  const listeners = { onPressOnce: null, };
  const action = { pressedOnce: false, down: false };
  function onKey(e) {
    switch(e.keyCode) {
      case KEY_W: case KEY_S: case KEY_A: case KEY_D:
        keyboard[e.keyCode] = e.type === "keyup" ? 0 : 1;
        if(keysMove) {
          updateMove();
        }
        e.preventDefault();
      case KEY_LEFT: case KEY_RIGHT: case KEY_UP: case KEY_DOWN:
        keyboard[e.keyCode] = e.type === "keyup" ? 0 : 1;
        updateMove();
        e.preventDefault();
        break;
      case KEY_SPACE:
      case KEY_ENTER:
        action.down = e.type === 'keyup' ? 0 : 1;
        e.preventDefault();
        break;
      case KEY_P:
      case KEY_ESCAPE:
        action.cancel = e.type === 'keyup' ? 0 : 1;
        e.preventDefault();
        break;
    }
    if(!action.pressedOnce) {
      action.pressedOnce = true;
    }
    if(listeners.onPressOnce) {
      listeners.onPressOnce();
      listeners.onPressOnce = null;
    }
  }

  function updateMove() {
    let dx = 0, dy = 0, rot = 0;
    if (keyboard[KEY_UP] || keyboard[KEY_W]) {
      dy--;
    }
    if (keyboard[KEY_DOWN] || keyboard[KEY_S]) {
      dy++;
    }
    if (keyboard[KEY_LEFT] || keyboard[KEY_A]) {
      dx--;
    }
    if (keyboard[KEY_RIGHT] || keyboard[KEY_D]) {
      dx++;
    }
    move.dx = dx;
    move.dy = dy;
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup", onKey);
  return {
    keysMove,
  	keyboard,
  	move,
    action,
    listeners,
  };	
}();