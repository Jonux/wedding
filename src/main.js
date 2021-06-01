import App from "./App.svelte";  

const app = new App({
  target: document.body,
  props: {
    name: "world",
    subName: "test",
  },
});

export default app;
