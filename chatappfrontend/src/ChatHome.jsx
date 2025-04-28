import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
	const [connection, setConnection] = useState(null);
	const [usermessages, setUserMessages] = useState([]);
	const [userName, setUserName] = useState('');
	const [chatRoom, setChatRoom] = useState('General');
	const [chatRole, setChatRole] = useState('Student');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Letar efter SignalR connection, finns inte i b�rjan
		// Efter anv�ndare joinar chatt triggas denna eftersom setConnection k�rs
		if (connection) {
			// Sub p� ReceiveMessage f�r att l�gga till nya meddelanden i state
			connection.on("ReceiveMessage", (user, message, role) => {
				setUserMessages(prevMessages => {
					const newMessages = [...prevMessages, { user, message, role }];
					return newMessages.slice(-4); // Keep only the last 10 messages
				});
			});

			// Hanterar vad som h�nder vid st�ngd connection
			connection.onclose(() => {
				console.log("Connection closed");
			});
		}
	}, [connection]);

	// Sk�ter vad som h�nder n�r anv�ndare ansluter sig till chatt
	const joinChatRoom = async (userName, chatRoom, chatRole) => {
		setLoading(true);

		// S�tter connection, med h�rdkodad URL f�r chathub
		const connection = new HubConnectionBuilder()
			.withUrl("https://localhost:7264/chat")
			.configureLogging(LogLevel.Information)
			.build();

		setConnection(connection); // S�tter connection innan den skapas

		try {
			await connection.start(); // Starta connection
			await connection.invoke("JoinChatRoom", userName, chatRoom, chatRole); // Invokar servermetod f�r att joina chatroom
			setLoading(false);
		} catch (error) {
			console.error("Error starting connection: ", error);
			setLoading(false);
		}
	};

	// St�nger av connectionen n�r anv�ndaren vill g� ur ett chatroom
	const quitChatRoom = async () => {
		setLoading(true);

		// Kollar s� att det finns en connection
		if (connection) {
			try {
				const userConnection = {
					UserName: userName,
					ChatRoom: chatRoom,
					ChatRole: chatRole
				};

				await connection.invoke("QuitChatRoom", userConnection); // Invokar servermetod f�r att l�mna chatroom
				await connection.stop(); // St�nger av connection
				setLoading(false);
			} catch (error) {
				console.error("Error stopping connection: ", error);
				setLoading(false);
			}
			finally {
				// S�tter alla v�rden tillbaka till sina standardv�rden
				// det viktiga �r att connection �r null, messages t�ms, och att user resettas
				setConnection(null);
				setUserMessages([]);
				setUserName('');
				setChatRoom('General');
				setChatRole('Student');
				setLoading(false);
			}
		}
	};

	// Skickar ett meddelande, kallar p� SendMessage i backend
	const sendMessage = async (message) => {
		if (connection) {
			await connection.invoke("SendMessage", chatRoom, userName, message);
		}
	};

	// Sk�ter vad som h�nder n�r man byter roll med radioknapp
	const handleRoleChange = (e) => {
		setChatRole(e.target.value);
	};

	// Rendering
	return (
		<div className="flex flex-col h-screen bg-gray-900">
			<main className="container mx-auto flex-grow">
				{loading ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-white">Connecting to chat room...</p>
					</div>
				) : connection ? (
					<>
						<div className="text-center text-2xl text-white font-semibold py-2 bg-gray-800 shadow">
							{chatRoom === "General" ? "General" : "Announcements"}
						</div>

						{/* Calls till komponenter, med parametrar */}
						<ChatRoom usermessages={usermessages} />
						<ChatBox sendMessage={sendMessage} chatRoom={chatRoom} chatRole={chatRole} quitChatRoom={quitChatRoom} />
					</>
				) : (
					<div className="flex items-center justify-center min-h-screen bg-gray-900">
						<div className="login-container">
							<h2 className="text-xl font-bold mb-4 text-center">Join Chat Room</h2>
							<input type="text" placeholder="Enter your name" value={userName} onChange={(e) => setUserName(e.target.value)} />
							<br />
							<br />
							{/* L�ter anv�ndaren v�lja chatroom med en dropdown-meny */}
							<select value={chatRoom} onChange={(e) => setChatRoom(e.target.value)}>
								<option value="General">General</option>
								<option value="Announcements">Announcements</option>
							</select>
							<br />
							<br />
							{/* L�ter anv�ndaren v�lja roll med radioknappar */}
							<div className="mb-4">
								<input type="radio" name="role" value="Student" id="student" checked={chatRole === "Student"} onChange={handleRoleChange} />
								<label htmlFor="student" className="ml-2">Student</label><br />
								<input type="radio" name="role" value="Teacher" id="teacher" checked={chatRole === "Teacher"} onChange={handleRoleChange} />
								<label htmlFor="teacher" className="ml-2">Teacher</label>
							</div>
							<br />
							{/* Knapp f�r att joina ett chatroom */}
							<button onClick={() => joinChatRoom(userName, chatRoom, chatRole)}>Join Chat Room</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default ChatHome;
