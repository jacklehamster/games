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
  const KEY_SPACE = 32;
  const keyboard = [];
  let move = {
  	dx: 0,
  	dy: 0,
  };
  const action = {};
  function onKey(e) {
    switch(e.keyCode) {
      case KEY_LEFT: case KEY_RIGHT: case KEY_UP: case KEY_DOWN:
      case KEY_W: case KEY_S: case KEY_A: case KEY_D:
      case KEY_Q: case KEY_E:
        keyboard[e.keyCode] = e.type === "keyup" ? 0 : 1;
        updateMove();
        e.preventDefault();
        break;
      case KEY_SPACE:
        action.down = e.type === 'keyup' ? 0 : 1;
        e.preventDefault();
        break;
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
  	keyboard,
  	move,
    action,
  };	
}();