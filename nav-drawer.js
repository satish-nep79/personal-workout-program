// nav-drawer.js
window.loadNav = async function () {
    const navResponse = await fetch("nav-drawer.html");
    const navHtml = await navResponse.text();
    document.getElementById("nav-placeholder").innerHTML = navHtml;
  
    function toggleDrawer() {
      const navDrawer = document.getElementById("nav-drawer");
      if (navDrawer.style.left === "0px") {
        navDrawer.style.left = "-250px";
      } else {
        navDrawer.style.left = "0px";
      }
    }
  
    document
      .querySelector(".hamburger-icon")
      .addEventListener("click", toggleDrawer);
  };
  