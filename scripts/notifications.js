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

function addNotification(ncrNumber, actionType) {
	const notifications = getNotifications();

	const messageActionType = {
		create: "was created",
		update: "was updated",
		delete: "was deleted",
	};

	const newNotification = {
		id: Date.now(),
		message: `NCR ${ncrNumber} ${messageActionType[actionType]}`,
		time: new Date().toLocaleString(),
		type: actionType,
		unread: true,
	};

	notifications.unshift(newNotification);
	saveNotifications(notifications);

	//display the new notifications list
	displayNotifications();
}

// function to mark the message as opened
function markAsRead(id) {
	const notifications = getNotifications();
	const notification = notifications.find((n) => n.id === id);

	if (notification) {
		notification.unread = false;
		saveNotifications(notifications);
		displayNotifications();
	}
}

function displayNotifications() {
	const list = document.querySelector(".notification-list");
	const emptyMsg = document.getElementById("no-notifications");
	const notifications = getNotifications();

	list.innerHTML = "";

	if (notifications.length === 0) {
		emptyMsg.style.display = "block";
		return;
	}

	emptyMsg.style.display = "none";

	notifications.forEach((notif) => {
		const li = document.createElement("li");
		li.className = "notification-item";
		if (notif.unread) li.classList.add("unread");

		li.setAttribute("onclick", `markAsRead(${notif.id})`);

		li.innerHTML = `
      <div class="notif-content">
        <p class="notif-text">${notif.message}</p>
        <span class="notif-time">${notif.time}</span>
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
