const inputImage = document.getElementById("input-img");
const itemPool = document.querySelector(".item-pool");
const tierContainers = document.querySelectorAll(".tier-items");

const classDragging = "dragging";

let sourceContainer = null;
let draggedItem = null;

let initialItems = [];

let dropTarget = null;
let dropContainer = null;
let dropInsertBefore = null;

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

/*   drag & drop Start and End events    */
const handleDragStart = (event) => {
  draggedItem = event.target.closest(".tier-item");
  sourceContainer = draggedItem.parentNode;
  event.dataTransfer.setData("text/plain", draggedItem.src);
};

const handleDragEnd = (event) => {
  draggedItem = null;
  sourceContainer = null;
};

/*   drag & drop and leave with clean events  */
const cleanupDrop = () => {
  if (dropContainer) {
    dropContainer.classList.remove(classDragging);
  }
  dropTarget = null;
  dropContainer = null;
  dropInsertBefore = null;
};

const handleDragLeave = (event) => {
  const related = event.relatedTarget;

  if (!event.currentTarget.contains(related)) {
    cleanupDrop();
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  const container = event.currentTarget;
  const target = event.target.closest(".tier-item");

  dropContainer = container;
  container.classList.add(classDragging);

  if (target && container.contains(target) && draggedItem !== target) {
    const rect = target.getBoundingClientRect();
    const isLeft = event.clientX < rect.left + rect.width / 2;
    dropInsertBefore = isLeft ? target : target.nextSibling;
  } else {
    dropInsertBefore = null;
  }
};

const handleDrop = (event) => {
  event.preventDefault();

  if (!draggedItem || !dropContainer) return;

  if (dropInsertBefore) {
    dropContainer.insertBefore(draggedItem, dropInsertBefore);
  } else {
    dropContainer.appendChild(draggedItem);
  }

  cleanupDrop();
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

tierContainers.forEach((row) => {
  row.addEventListener("dragover", handleDragOver);
  row.addEventListener("dragleave", handleDragLeave);
  row.addEventListener("drop", handleDrop);
});

// pool to tiers
itemPool.addEventListener("drop", handleDrop);
itemPool.addEventListener("dragover", handleDragOver);
itemPool.addEventListener("dragleave", handleDragLeave);

// from desktop
itemPool.addEventListener("dragover", handleDragOverFromDesktop);
itemPool.addEventListener("drop", handleDropFromDesktop);
