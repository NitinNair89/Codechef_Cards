import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AddUserMenu from "./AddUserMenu";
import Card from "./Card";
import Modal from "./Modal";

export default function App() {
	const api_url = "https://competitive-coding-api.herokuapp.com/api/codechef/";

	const [users, setUsers] = useState([]); // Current Users.
	const [usersData, setUsersData] = useState([]); // Current Users Data.

	const [userFetched, setUserFetched] = useState([]); // Recently FETCHED User.

	// To Control State Of Modal.
	const [showModal, setShowModal] = useState({
		visible: false,
		type: "",
		msg: "",
		acceptFunc: null,
	});

	// To Fetch User Data From API.
	const fetchData = (username) => {
		fetch(api_url + username)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// console.log(data);
				if (data.status === "Success") {
					setUserFetched({
						...data,
						user_details: { ...data.user_details, username },
					});
				} else {
					console.log("Invalid Username");
					removeUser(username);
				}
			})
			.catch((error) => console.log("Error:", error));
	};

	// Loading Stored User And Fetching User Data. [RUNS ONLY ONCE]
	useEffect(() => {
		let user_temp = JSON.parse(localStorage.getItem("users"));
		if (user_temp) {
			setUsers(user_temp);
			user_temp.forEach((username) => {
				fetchData(username);
			});
		} else {
			setUsers([]);
		}
	}, []);

	// Storing User Data After Fecthing.
	useEffect(() => {
		if (userFetched.length === 0) return;
		if (userFetched.rating === 0) {
			userFetched.stars = "1★";
			userFetched.global_rank = "Not Ranked!";
			userFetched.country_rank = "Not Ranked!";
		}

		setUsersData(() => [...usersData, userFetched]);
		setUserFetched([]);
	}, [userFetched, usersData]);

	// To Remove User From 'users' And 'localStorage'.
	const removeUser = (username) => {
		setUsersData((usersData) =>
			usersData.filter((data) => data.user_details.username !== username)
		);
		let users_temp = new Set(users);
		users_temp.delete(username);
		setUsers(Array.from(users_temp));
		localStorage.setItem("users", JSON.stringify(Array.from(users_temp)));
	};

	return (
		<div className="App">
			<Header />
			<div className="Content">
				<AddUserMenu
					setUsers={setUsers}
					users={users}
					fetchData={fetchData}
					setShowModal={setShowModal}
				/>

				<div className="CardList">
					{usersData
						.sort((first, second) => {
							return second.rating - first.rating;
						})
						.map((user) => {
							return (
								<Card
									key={user.user_details.username}
									user_data={user}
									setShowModal={setShowModal}
									removeUser={removeUser}
								/>
							);
						})}
				</div>

				{showModal.visible && (
					<div className="backDrop">
						<Modal modalData={showModal} setShowModal={setShowModal} />
					</div>
				)}
			</div>
			<Footer />
		</div>
	);
}