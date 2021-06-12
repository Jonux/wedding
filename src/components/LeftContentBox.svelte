
<div class="container">
    <div class="image-container">
        <img src={$$props.src} alt="image" class="image" />
    </div>
    <div class="text-area"> 
        <h2>{$$props.title}</h2>
        <slot></slot>
    </div>
</div>

<style type="text/scss">
  @import './variables';

    .container {
        display: flex;
        margin-top: 20px;
    }
    .image-container {
        width: 50%;
    }

    .text-area {
        text-align: left;
        padding: 20px;
    }

    .image {
        height: 200px;
    }
</style>
