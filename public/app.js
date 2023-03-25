document.querySelectorAll(".price").forEach((node) => {
  node.textContent = new Intl.NumberFormat("en-US", {
    currency: "usd",
    style: "currency",
  }).format(node.textContent);
});
