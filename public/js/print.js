document.addEventListener("DOMContentLoaded", function () {
    const printButton = document.getElementById("printButton");
    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }
});
