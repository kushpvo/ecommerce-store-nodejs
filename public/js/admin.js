const deleteProduct = btn => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  const productEletement = btn.closest(".col-sm");

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: { "csrf-token": csrf }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      productEletement.parentNode.removeChild(productEletement);
    })
    .catch(err => {
      console.log(err);
    });
};
