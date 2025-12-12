//Mock notifications
if (!localStorage.getItem("ncr_notifications")) {
	fetch("data/notifications.json")
		.then((res) => {
			if (!res.ok) throw new Error("Failed to load users.json");
			return res.json();
		})
		.then((json) => {
			mockNotifications = json;
			localStorage.setItem(
				"ncr_notifications",
				JSON.stringify(mockNotifications)
			);
		})
		.catch((err) => console.error("Error loading user data:", err));
}

//function to get notification
function getNotifications() {
	return JSON.parse(localStorage.getItem("ncr_notifications")) || [];
}
// function to save notification
function saveNotifications(notifs) {
	localStorage.setItem("ncr_notifications", JSON.stringify(notifs));
}

// Add notification
function addNotification(ncrNumber, actionType) {
	const notifications = getNotifications();
	const allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
	const record = allRecords.find((r) => r.ncrNumber === ncrNumber);

	const messageActionType = {
		create: "was created",
		update: "was updated",
		delete: "was deleted",
	};

	let message = `NCR ${ncrNumber} ${
		messageActionType[actionType] || ""
	}`.trim();

	if (actionType === "update" && record) {
		if (record.currentStage === "Engineering") {
			message = "Quality section completed";
		} else if (record.currentStage === "Operations") {
			message = "Engineering section completed";
		} else if (record.currentStage === "Purchasing") {
			message = "Operations section completed";
		} else if (record.status === "Closed") {
			message = "Purchasing section completed";
		}
	}

	const newNotification = {
		id: Date.now(),
		message: message,
		time: new Date().toLocaleString(),
		type: actionType,
		unread: true,
		ncrNumber: ncrNumber,
	};

	notifications.unshift(newNotification);
	saveNotifications(notifications);

	//display the new notifications list
	displayNotifications();
}

// function to mark the message as opened
function markAsRead(event, id) {
	event.stopPropagation();
	const notifications = getNotifications();
	const notification = notifications.find((n) => n.id === id);
	// localStorage.setItem("selectedNCR", num);
	if (notification) {
		notification.unread = false;
		saveNotifications(notifications);
		displayNotifications();
	}
}

// function to view the report
function viewReport(ncrNumber) {
	localStorage.setItem("selectedNCR", ncrNumber);
	window.location.href = "edit-ncr.html";
}

function displayNotifications() {
	const list = document.querySelector(".notification-list");
	const emptyMsg = document.getElementById("no-notifications");
	const notifications = getNotifications();
	const allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];

	list.innerHTML = "";

	if (notifications.length === 0) {
		emptyMsg.style.display = "block";
		return;
	}

	emptyMsg.style.display = "none";

	notifications.forEach((notif) => {
		const li = document.createElement("li");
		li.className = "notification-item";

		const record = allRecords.find((r) => r.ncrNumber === notif.ncrNumber);
		let text = "";
		if (record) {
			if (record.status === "Closed") {
				text = "Closed Successfully";
			} else if (record.currentStage === "Quality") {
				text = `Sent to Engineering`;
			} else {
				text = `Sent to ${record.currentStage}`;
			}
		} else {
			text = "";
		}

		if (notif.unread) {
			li.style.backgroundColor = "#f0f7ff";
			li.style.borderLeft = "4px solid #5896c9";
		} else {
			li.style.backgroundColor = "transparent";
			li.style.borderLeft = "4px solid transparent";
		}

		li.innerHTML = `
      <div class="notif-content">
		<div>
			<p class="notification-title">NCR ${notif.ncrNumber} ${text}</p>
			
			<div class="notification-description">${notif.message}</div>
		</div>
    	
        <div class="notification-footer">
          
		  	<span class="notif-time">${notif.time}</span>
		  
          <div class="footer-btns">
			<button class="btn" onclick="viewReport('${
				notif.ncrNumber
			}')">View Report</button>
			<button class="btn" onclick="markAsRead(event, ${
				notif.id
			})">Mark as Read</button>
		  </div>
        </div>
      </div>
      ${notif.unread ? `<span class="notif-status-dot"></span>` : ""}
    `;

		list.appendChild(li);
	});

	const indicator = document.getElementById("notification-indicator");
	const unreadCount = notifications.filter((n) => n.unread).length;

	if (unreadCount === 0) {
		indicator.classList.add("hidden");
		indicator.textContent = "";
	} else {
		indicator.classList.remove("hidden");
		indicator.textContent = unreadCount;
	}
}

document.addEventListener("DOMContentLoaded", displayNotifications);
