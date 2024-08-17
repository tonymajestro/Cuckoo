function decrement(e) {
  const btn = e.target.parentNode.parentElement.querySelector(
    'button[data-action="decrement"]'
  );
  const target = btn.nextElementSibling;
  let value = Number(target.textContent);

  if (value > 0) {
    value--;
    target.textContent = value;
  }
}

function increment(e) {
  const btn = e.target.parentNode.parentElement.querySelector(
    'button[data-action="decrement"]'
  );
  const target = btn.nextElementSibling;
  let value = Number(target.textContent);

  if (value < 5) {
    value++;
    target.textContent = value;
  }
}

function deleteUser(e) {
  const user = e.target.parentNode
  user.style.transition = "opacity 0.4s ease"
  user.style.opacity = 0;

  setTimeout(function() {
    user.parentNode.removeChild(user);
  }, 400);
}

window.onload = (event) => {
  const decrementButtons = document.querySelectorAll(`button[data-action="decrement"]`);
  const incrementButtons = document.querySelectorAll(`button[data-action="increment"]`);
  const deleteButtons = document.querySelectorAll(`button[data-action="delete"]`);

  decrementButtons.forEach(btn => {
    btn.addEventListener("click", decrement);
  });

  incrementButtons.forEach(btn => {
    btn.addEventListener("click", increment);
  })

  deleteButtons.forEach(btn => {
    btn.addEventListener("click", deleteUser)
  })

  // const players = document.querySelector(".players");
  // Sortable.create(players)
};
