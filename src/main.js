import App from "./App.svelte";  

const app = new App({
  target: document.body,
  props: {
	contactInfo: "Yhteyshenkilöt"
  },
});

export default app;
