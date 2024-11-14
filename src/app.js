import axios from "https://cdn.skypack.dev/axios";

async function fetchImages(imgQuantity) {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/photos"
    );
    return response.data.slice(0, imgQuantity);
  } catch (error) {
    console.error("Ошибка при получении изображений:", error);
    return [];
  }
}

const CARD_MARGIN = 40;

class ImageSlider {
  constructor(gallery, prevButton, nextButton, scrollStep = 500) {
    this.track = gallery;
    this.prevBtn = prevButton;
    this.nextBtn = nextButton;
    this.images = [];
    this.currentOffset = 0;
    this.scrollStep = scrollStep;
    this.init();
  }

  async init() {
    //Обрезала до 10, чтобы было легче проверить работу слайдера, тк всего картинок 5 тысяч
    this.images = await fetchImages(10);
    this.renderImages();
    this.updateButtons();
    this.attachEventListeners();
    window.addEventListener("resize", () => this.updateButtons());
  }

  renderImages() {
    this.track.innerHTML = this.images
      .map(
        (image) =>
          `<div class="card">
                <img src="${image.url}" alt="${image.title}">
                <div class="card__title">${image.title}</div>
            </div>`
      )
      .join("");
  }

  getMaxOffset() {
    if (window.innerWidth <= 510) {
      this.scrollStep = 400;
    }
    if (window.innerWidth <= 410) {
      this.scrollStep = 300;
    }
    const visibleCards = Math.floor(
      window.innerWidth / (this.scrollStep - 2 * CARD_MARGIN)
    );
    const totalCards = this.images.length;
    return (totalCards - visibleCards) * this.scrollStep;
  }

  updateButtons() {
    const maxOffset = this.getMaxOffset();
    this.prevBtn.disabled = this.currentOffset <= 0;
    this.nextBtn.disabled = this.currentOffset >= maxOffset;
  }

  attachEventListeners() {
    this.nextBtn.addEventListener("click", () => this.nextImage());
    this.prevBtn.addEventListener("click", () => this.prevImage());

    // Поддержка свайпа в мобильной версии
    let startX = 0;
    this.track.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX)
    );
    this.track.addEventListener("touchend", (e) => {
      let endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) this.nextImage();
      else if (endX - startX > 50) this.prevImage();
    });
  }

  nextImage() {
    const maxOffset = this.getMaxOffset();
    if (this.currentOffset < maxOffset) {
      this.currentOffset += this.scrollStep;
      this.updateSliderPosition();
    }
  }

  prevImage() {
    if (this.currentOffset > 0) {
      this.currentOffset -= this.scrollStep;
      this.updateSliderPosition();
    }
  }

  updateSliderPosition() {
    this.track.style.transform = `translateX(-${this.currentOffset}px)`;
    this.updateButtons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  const prevButton = document.getElementById("prevBtn");
  const nextButton = document.getElementById("nextBtn");
  new ImageSlider(gallery, prevButton, nextButton);
});
