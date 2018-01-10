
let id = 0;

const getId = () => ('0000000000' + (++id)).match(/[\w]{6}$/)[0];

const getEl = () => document.querySelector('#log');

function appendMsg(msg) {
  const $el = getEl();
  const $line = document.createElement('div');
  const $id = document.createElement('span');
  const $msg = document.createElement('span');
  $msg.innerHTML = msg;
  $id.innerHTML = getId();
  $line.appendChild($id);
  $line.appendChild($msg);
  $el.appendChild($line);

  if ($el.querySelectorAll('#log > div').length > 200) {
    $el.removeChild($el.querySelector('#log > div'));
  }

  //滚动滚动条至最下面
  setTimeout(() => {
    $el.scrollTo(0, 99999);
  }, 10);
}

export function info(msg) {
  appendMsg(msg);
}

export function clear() {
  const $el = getEl();
  $el.innerHTML = '';
}
