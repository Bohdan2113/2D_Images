window.onload = function () {
  const canvas = document.getElementById("myCanvas");
  canvas.width = window.innerHeight + 100;
  canvas.height = window.innerHeight - 40;

  const inputFields = GetInputsFields();
  inputFields.segmentCountField.min = "1";
  inputFields.segmentCountField.max = canvas.height / 2 - 30;

  // Додаємо події на введення для полів X і Y
  inputFields.xField.addEventListener("input", updateMaxDiagonals);
  inputFields.yField.addEventListener("input", updateMaxDiagonals);

  inputFields.DField.addEventListener("input", (event) =>
    event.target.classList.add("filled")
  );
  inputFields.dField.addEventListener("input", (event) =>
    event.target.classList.add("filled")
  );

  inputFields.xField.addEventListener("input", hideErrorMessage);
  inputFields.yField.addEventListener("input", hideErrorMessage);
  inputFields.DField.addEventListener("input", hideErrorMessage);
  inputFields.dField.addEventListener("input", hideErrorMessage);
  inputFields.segmentCountField.addEventListener(
    "input",
    hideSegmentErrorMessage
  );

  inputFields.xField.addEventListener("input", checkInterval);
  inputFields.yField.addEventListener("input", checkInterval);
  inputFields.DField.addEventListener("input", checkInterval);
  inputFields.dField.addEventListener("input", checkInterval);
  inputFields.segmentCountField.addEventListener("input", checkIntervalSegment);
};

function GetInputsFields() {
  return {
    segmentCountField: document.getElementById("segment-count"),

    nameField: document.getElementById("text"),
    xField: document.getElementById("X"),
    yField: document.getElementById("Y"),
    DField: document.getElementById("D"),
    dField: document.getElementById("d"),
    colorDField: document.getElementById("colorD"),
    colorDsmallField: document.getElementById("colorDsmall"),
    fillColorField: document.getElementById("fillColor"),
  };
}
function SetRestrictionsForInput(segmentCount, quarterSet) {
  const inputFields = GetInputsFields();
  const max = inputFields.segmentCountField.value;

  inputFields.DField.min = "0";
  inputFields.dField.min = "0";
  inputFields.DField.max = max;
  inputFields.dField.max = max;

  if (quarterSet[0] === true) {
    inputFields.xField.min = "0";
    inputFields.xField.max = max;
    inputFields.yField.min = "0";
    inputFields.yField.max = max;
  } else if (quarterSet[1] === true) {
    inputFields.xField.min = max * -1;
    inputFields.xField.max = "0";
    inputFields.yField.min = "0";
    inputFields.yField.max = max;
  } else if (quarterSet[2] === true) {
    inputFields.xField.min = max * -1;
    inputFields.xField.max = "0";
    inputFields.yField.min = max * -1;
    inputFields.yField.max = "0";
  } else if (quarterSet[3] === true) {
    inputFields.xField.min = 0;
    inputFields.xField.max = max;
    inputFields.yField.min = max * -1;
    inputFields.yField.max = "0";
  }
}
function GetUnitLength(count, segmentSize) {
  const factors = [2, 2.5, 2];
  let index = 0;
  let base = 20;
  let interval = 1;

  if (count < base) return interval * segmentSize;

  do {
    interval *= factors[index++];
    if (index >= factors.length) index = 0;

    base *= factors[index];
  } while (count >= base);

  return interval * segmentSize;
}
function EnableButtons() {
  let container = document.querySelector(".buttons-container");
  container.style.opacity = "1"; // Робимо блок нормальним
  container.style.pointerEvents = "auto"; // Дозволяємо натискання кнопок
}

function ClearAll() {
  document.getElementById("segment-count").value = "";
  ClearCoordSystem();
  ClearButtonsContainer();
  ClearRombList();
}
function ClearCoordSystem() {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function ClearRombList() {
  oselList.forEach((r) => {
    RemoveRombFromList(r.id);
  });
}
function ClearButtonsContainer() {
  const container = document.querySelector(".buttons-container");
  const inputFields = GetInputsFields();

  container.style.opacity = 0.5; /* Робить блок сірішим */
  container.style.pointerEvents = "none"; /* Забороняє натискати кнопки */

  inputFields.nameField.value = "";
  inputFields.xField.value = "";
  inputFields.yField.value = "";
  inputFields.DField.value = "";
  inputFields.dField.value = "";
  inputFields.colorDField.value = "#000000";
  inputFields.colorDsmallField.value = "#000000";
  inputFields.fillColorField.value = "#FFFFFF";

  let errorElement = document.getElementById("error-message-params");
  errorElement.style.display = "none";

  inputFields.xField.style.border = "1px solid black";
  inputFields.yField.style.border = "1px solid black";
  inputFields.DField.style.border = "1px solid black";
  inputFields.dField.style.border = "1px solid black";

  inputFields.DField.classList.remove("filled");
  inputFields.dField.classList.remove("filled");
}

function DrawCoordsBtn() {
  if (!CheckSegmentCount()) return;

  ClearRombList();
  ClearCoordSystem();
  ClearButtonsContainer();

  EnableButtons();
  DrawCoords();
}
function DrawCoords() {
  const segmentCountField = document.getElementById("segment-count");
  const segmentCount = parseInt(segmentCountField.value);

  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  const quarterSet = [true, false, false, false];
  SetRestrictionsForInput(segmentCount, quarterSet);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const sideLength = canvas.height / 2 - 30;
  const segmentSize = sideLength / (segmentCount + 1);
  const unitLength = GetUnitLength(segmentCount, segmentSize);
  const unitSize = sideLength / 70;
  const arrowSize = sideLength / 30;

  ctx.beginPath(); // coordinate system
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.moveTo(centerX, centerY - sideLength);
  ctx.lineTo(centerX, centerY + sideLength);
  ctx.moveTo(centerX - sideLength, centerY);
  ctx.lineTo(centerX + sideLength, centerY);

  ctx.font = "10px Arial";
  DrawUnitsY(centerX, centerY, true); // unit segment
  DrawUnitsYNegative(centerX, centerY, true);
  DrawUnitsXNegative(centerX, centerY, true);
  DrawUnitsX(centerX, centerY, true);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath(); // arrow on Y
  ctx.moveTo(centerX + sideLength - arrowSize, centerY - arrowSize / 2);
  ctx.lineTo(centerX + sideLength, centerY);
  ctx.lineTo(centerX + sideLength - arrowSize, centerY + arrowSize / 2);
  ctx.stroke();

  ctx.beginPath(); // arrow on X
  ctx.moveTo(centerX - arrowSize / 2, centerY - sideLength + arrowSize);
  ctx.lineTo(centerX, centerY - sideLength);
  ctx.lineTo(centerX + arrowSize / 2, centerY - sideLength + arrowSize);
  ctx.stroke();

  ctx.font = "15px Arial"; // x / y text
  ctx.fillText("x", centerX + sideLength + arrowSize / 2, centerY);
  ctx.fillText("y", centerX, centerY - sideLength - arrowSize / 2);

  ctx.beginPath(); // Намалювати сітку на координатах
  ctx.lineWidth = 0.1;
  DrawGrid(unitLength);
  ctx.stroke();

  function DrawUnitsY(X, downY, isNumerate) {
    for (
      var i = unitLength / segmentSize;
      i <= segmentCount;
      i += unitLength / segmentSize
    ) {
      const startX = X - unitSize;
      const endX = X + unitSize;

      let startY = downY - i * segmentSize;
      let endY = downY - i * segmentSize;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      if (isNumerate) {
        const textX = endX + 5;
        const textY = startY + 3;
        ctx.fillStyle = "black";
        ctx.fillText(Math.round(i), textX, textY);
      }
    }
  }
  function DrawUnitsX(leftX, topY, isNumerate) {
    for (
      var i = unitLength / segmentSize;
      i <= segmentCount;
      i += unitLength / segmentSize
    ) {
      const startY = topY - unitSize;
      const endY = topY + unitSize;

      let startX = leftX + i * segmentSize;
      let endX = leftX + i * segmentSize;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      if (isNumerate) {
        const textX = startX - 3;
        const textY = endY + 10;
        ctx.fillStyle = "black";
        ctx.fillText(Math.round(i), textX, textY);
      }
    }
  }
  function DrawUnitsYNegative(X, downY, isNumerate) {
    for (
      var i = unitLength / segmentSize;
      i <= segmentCount;
      i += unitLength / segmentSize
    ) {
      const startX = X - unitSize;
      const endX = X + unitSize;

      let startY = downY + i * segmentSize;
      let endY = downY + i * segmentSize;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      if (isNumerate) {
        const textX = endX + 5;
        const textY = startY + 3;
        ctx.fillStyle = "black";
        ctx.fillText(Math.round(i) * -1, textX, textY);
      }
    }
  }
  function DrawUnitsXNegative(leftX, topY, isNumerate) {
    for (
      var i = unitLength / segmentSize;
      i <= segmentCount;
      i += unitLength / segmentSize
    ) {
      const startY = topY - unitSize;
      const endY = topY + unitSize;

      let startX = leftX - i * segmentSize;
      let endX = leftX - i * segmentSize;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      if (isNumerate) {
        const textX = startX - 3;
        const textY = endY + 10;
        ctx.fillStyle = "black";
        ctx.fillText(Math.round(i) * -1, textX, textY);
      }
    }
  }
  function DrawGrid(gap) {
    const lineHCount = canvas.height / (unitLength + 1);
    const lineWCount = canvas.width / (unitLength + 1);
    for (let i = 0; i <= lineHCount; i++) {
      let Y = centerY + i * gap;
      let _Y = centerY - i * gap;
      ctx.moveTo(0, Y);
      ctx.lineTo(canvas.width, Y);

      ctx.moveTo(0, _Y);
      ctx.lineTo(canvas.width, _Y);
    }
    for (let i = 0; i <= lineWCount; i++) {
      let X = centerX + i * gap;
      let _X = centerX - i * gap;
      ctx.moveTo(X, 0);
      ctx.lineTo(X, canvas.height);

      ctx.moveTo(_X, 0);
      ctx.lineTo(_X, canvas.height);
    }
  }
}
function CheckSegmentCount() {
  const segmentCountField = document.getElementById("segment-count");
  const segmentCount = parseInt(segmentCountField.value);
  if (
    segmentCount > segmentCountField.max ||
    segmentCount < segmentCountField.min
  ) {
    showErrorMessage(
      segmentCount +
        " is out of range [" +
        segmentCountField.min +
        ", " +
        segmentCountField.max +
        "]",
      "error-message-segment"
    );
    return false;
  }

  return true;
}

let oselList = [];
let rhombusId = 0;

function DrawOsel() {
  if (!ValidateForm()) {
    return;
  }

  const inputFields = GetInputsFields();
  const listUL = document.getElementById("romb-list");

  const rombData = {
    id: rhombusId++,
    name: inputFields.nameField.value || "(noname)",
    x: parseFloat(inputFields.xField.value),
    y: parseFloat(inputFields.yField.value),
    D: parseFloat(inputFields.DField.value),
    d: parseFloat(inputFields.dField.value),
    colorD: inputFields.colorDField.value,
    colorDsmall: inputFields.colorDsmallField.value,
    fillColor: inputFields.fillColorField.value,
  };
  oselList.push(rombData);
  AddToListUL(rombData, listUL);
  DrawRhomb(rombData);

  inputFields.DField.classList.remove("filled");
  inputFields.dField.classList.remove("filled");
}
function DrawRhomb(rombData) {
  const inputFields = GetInputsFields();

  // Get canvas context
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Calculate sizes based on segment count
  const segmentCountField = document.getElementById("segment-count");
  const segmentCount = parseInt(segmentCountField.value);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const sideLength = canvas.height / 2 - 32;
  const segmentSize = sideLength / (segmentCount + 1);

  // Calculate romb center and circle radius
  const rombCenterX = centerX + rombData.x * segmentSize;
  const rombCenterY = centerY - rombData.y * segmentSize;
  const circleRadius =
    segmentSize *
    ((rombData.D * rombData.d) /
      (2 * Math.sqrt(Math.pow(rombData.D, 2) + Math.pow(rombData.d, 2))));

  // Draw romb
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rombCenterX, rombCenterY - (rombData.D / 2) * segmentSize);
  ctx.lineTo(rombCenterX + (rombData.d / 2) * segmentSize, rombCenterY);
  ctx.lineTo(rombCenterX, rombCenterY + (rombData.D / 2) * segmentSize);
  ctx.lineTo(rombCenterX - (rombData.d / 2) * segmentSize, rombCenterY);
  ctx.closePath();
  ctx.stroke();

  // Draw in-circle
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.fillStyle = rombData.fillColor;
  ctx.arc(
    rombCenterX,
    rombCenterY,
    circleRadius,
    0,
    2 * Math.PI,
    (anticlockwise = false)
  );
  ctx.stroke();
  ctx.fill();

  // Draw big diagonal
  ctx.beginPath();
  ctx.strokeStyle = rombData.colorD;
  ctx.lineWidth = 2;
  ctx.moveTo(rombCenterX, rombCenterY - (rombData.D / 2) * segmentSize);
  ctx.lineTo(rombCenterX, rombCenterY + (rombData.D / 2) * segmentSize);
  ctx.stroke();

  // Draw small diagonal
  ctx.beginPath();
  ctx.strokeStyle = rombData.colorDsmall;
  ctx.lineWidth = 2;
  ctx.moveTo(rombCenterX + (rombData.d / 2) * segmentSize, rombCenterY);
  ctx.lineTo(rombCenterX - (rombData.d / 2) * segmentSize, rombCenterY);
  ctx.stroke();
}
function AddToListUL(newRhombus, ul) {
  const li = document.createElement("li");
  li.id = `romb-${newRhombus.id}`;
  li.innerHTML = `
    <div style="display: flex; flex-direction: row;">
      <span class="romb-color" style="background-color: ${newRhombus.fillColor};"></span>
      <h3>${newRhombus.name} (X: ${newRhombus.x}, Y: ${newRhombus.y})<h3>
    </div>
    <button class="button_delete" onclick="deleteRhombus(${newRhombus.id})">Delete</button>
  `;

  ul.appendChild(li);
}

function showErrorMessage(message, where) {
  let errorElement = document.getElementById(where);
  errorElement.textContent = message;

  errorElement.style.display = "block"; // Показати повідомлення
}
function ValidateForm() {
  let coordFields = [];
  coordFields.push(document.getElementById("X"));
  coordFields.push(document.getElementById("Y"));
  coordFields.push(document.getElementById("D"));
  coordFields.push(document.getElementById("d"));
  let emptyFields = FilterEmptyFields(coordFields);

  if (emptyFields.length !== 0) {
    console.log(emptyFields);
    emptyFields.forEach((f) => (f.style.border = "1px solid red"));

    let message = "All fields must be defined";
    showErrorMessage(message, "error-message-params");
    return false;
  }

  for (let i = 0; i < coordFields.length; i++) {
    if (
      parseFloat(coordFields[i].value) > coordFields[i].max ||
      parseFloat(coordFields[i].value) < coordFields[i].min
    ) {
      coordFields[i].style.border = "1px solid red";
      showErrorMessage(
        coordFields[i].value +
          " is out of range [" +
          coordFields[i].min +
          ", " +
          coordFields[i].max +
          "]",
        "error-message-params"
      );
      return false;
    }
  }

  return true;
}

function FilterEmptyFields(fields) {
  let emptyFields = [];
  for (let i = 0; i < fields.length; i++)
    if (!fields[i].value.trim()) emptyFields.push(fields[i]);

  return emptyFields;
}

function deleteRhombus(id) {
  RemoveRombFromList(id);

  ClearCoordSystem();
  DrawCoords();
  oselList.forEach((r) => {
    DrawRhomb(r);
  });
}
function RemoveRombFromList(id) {
  const li = document.getElementById(`romb-${id}`);
  if (li) {
    li.remove();
  }
  oselList = oselList.filter((r) => r.id !== id);
}

function updateMaxDiagonals(event) {
  const inputFields = GetInputsFields();

  // Отримуємо значення
  const max = inputFields.segmentCountField.value;
  const x = inputFields.xField.value;
  const y = inputFields.yField.value;

  // Оновлюємо максимальні значення діагоналей
  if (event.target.id === "Y") {
    const maxD = Math.min(Math.abs(y), max - Math.abs(y)) * 2; // Тут приклад логіки для максимальних значень
    inputFields.DField.max = maxD; // Максимум для діагоналі D

    if (!inputFields.DField.classList.contains("filled")) {
      inputFields.DField.value = maxD; // Максимум для діагоналі D
      inputFields.DField.style.border = "1px solid black";
    }
  }

  if (event.target.id === "X") {
    const maxd = Math.min(Math.abs(x), max - Math.abs(x)) * 2; // Тут приклад логіки для максимальних значень
    inputFields.dField.max = maxd; // Максимум для діагоналі D

    if (!inputFields.dField.classList.contains("filled")) {
      inputFields.dField.value = maxd; // Максимум для діагоналі d
      inputFields.dField.style.border = "1px solid black";
    }
  }
}
function checkInterval(event) {
  const inputFields = GetInputsFields();

  const value = parseFloat(event.target.value); // Перетворюємо значення в число
  const min = parseFloat(event.target.min); // Перетворюємо мінімум в число
  const max = parseFloat(event.target.max); // Перетворюємо максимальне значення в число

  if (value === "") return;
  if (value < min || value > max) {
    showErrorMessage(
      value + " is out of range [" + min + ", " + max + "]",
      "error-message-params"
    );
    // event.target.value = "";

    if (event.target.id === inputFields.xField.id)
      inputFields.dField.value = "";
    else if (event.target.id === inputFields.yField.id)
      inputFields.DField.value = "";
  }
}
function checkIntervalSegment(event) {
  const inputFields = GetInputsFields();

  const value = parseFloat(event.target.value); // Перетворюємо значення в число
  const min = parseFloat(event.target.min); // Перетворюємо мінімум в число
  const max = parseFloat(event.target.max); // Перетворюємо максимальне значення в число

  if (value === "") return;
  if (value < min || value > max) {
    showErrorMessage(
      value + " is out of range [" + min + ", " + max + "]",
      "error-message-segment"
    );

    event.target.style.border = "1px solid red";
  }
}
function hideErrorMessage(event) {
  let errorElement = document.getElementById("error-message-params");
  errorElement.style.display = "none";

  event.target.style.border = "1px solid black";
}
function hideSegmentErrorMessage(event) {
  errorElement = document.getElementById("error-message-segment");
  errorElement.style.display = "none";

  event.target.style.border = "1px solid black";
}
