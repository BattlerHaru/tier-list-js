const inputImage = document.getElementById("input-img");
const itemPool = document.querySelector(".item-pool");

const classDragging = "dragging";

let initialItems = [];
let sourceContainer = null;

let draggedItem = null;

/*       Create Items events    */
const handleOnlyImageFiles = (files) => {
  files = Array.from(files).filter((file) => file.type.startsWith("image/"));
  return files.length > 0 ? files : false;
};

const useFilesToCreateItems = (files) => {
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (eventReader) => {
      const item = createItem(eventReader.target.result);
      itemPool.appendChild(item);
      initialItems.push(item);
    };
    reader.readAsDataURL(file);
  });
};

const createItem = (src) => {
  const item = document.createElement("div");
  const img = document.createElement("img");

  img.src = src;
  item.appendChild(img);
  item.className = "tier-item";
  item.draggable = true;

  item.addEventListener("dragstart", handleDragStart);
  item.addEventListener("dragend", handleDragEnd);

  return item;
};

/*      drag & drop events    */
const handleDragStart = (event) => {
  draggedItem = event.target.closest(".tier-item");
  sourceContainer = draggedItem.parentNode;
  event.dataTransfer.setData("text/plain", draggedItem.src);
};

const handleDragEnd = (event) => {
  draggedItem = null;
  sourceContainer = null;
};

// from desktop
const handleDragOverFromDesktop = (event) => {
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;

  if (dataTransfer.types.includes("Files")) {
    currentTarget.classList.add(classDragging);
  }
};

const handleDropFromDesktop = (event) => {
  event.preventDefault();

  if (draggedItem) return;

  const { dataTransfer, currentTarget } = event;

  if (!dataTransfer || !dataTransfer.files || dataTransfer.files.length === 0) {
    return;
  }

  const fileList = handleOnlyImageFiles(dataTransfer.files);

  if (!fileList) return;

  useFilesToCreateItems(fileList);

  currentTarget.classList.remove(classDragging);
};

inputImage.addEventListener("change", (event) => {
  const { files } = event.target;

  if (!files || files.length === 0) return;

  const fileList = handleOnlyImageFiles(files);

  if (!fileList) return;

  useFilesToCreateItems(fileList);
});

// from desktop
itemPool.addEventListener("dragover", handleDragOverFromDesktop);
itemPool.addEventListener("drop", handleDropFromDesktop);
