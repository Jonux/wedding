
<div class="container">
    <div class="text-area"> 
        <h2>{$$props.title}</h2>
        <p>{$$props.description}</p>
    </div>
    <div class="image-container">
        <img src={$$props.src} alt="image" class="image" />
    </div>
</div>

<style type="text/scss">
  @import './variables';

    .container {
        display: flex;
        margin-top: 20px;
    }
    .image-container {
        width: 40%;
    }

    .text-area {
        padding: 20px;
        width: 50%;
    }

    .image {
        height: 200px;
    }
</style>
