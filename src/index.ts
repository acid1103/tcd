export default () => {
    // wait until the DOM has been fully loaded. then call init
    const readyStateCheckInterval = setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            init();
        }
    }, 10);

    function init() {
        document.body.textContent = "Hello world!";
    }
};
