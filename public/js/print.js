document.addEventListener("DOMContentLoaded", function () {
    const printButton = document.getElementById("printButton");
    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("printButton").addEventListener("click", function () {
        window.print();
    });
});
