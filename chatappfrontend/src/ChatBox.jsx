import React from 'react';

const ChatBox = ({ sendMessage, chatRoom, chatRole, quitChatRoom }) => {
	const [message, setMessage] = React.useState("");

	// Skickar meddelande
	const handleSend = () => {
		if (message.trim()) {
			sendMessage(message);
			setMessage('');
		}
	};

	// Villkor för att knapp för att skicka meddelande i Announcement ska vara utgråad
	const isDisabled = chatRoom === 'Announcements' && chatRole === 'Student';

	// Rendering
	return (
		<div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600">
			<div className="flex items-end space-x-2">
				{/* Visar skickade meddelanden */}
				<textarea
					className="w-full p-2 bg-white rounded-2xl resize-none"
					rows="1"
					value={message.slice(-4)}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Type a message..."
					disabled={isDisabled}
				/>

				{/* Knapp för att skicka meddelanden */}
				<button
					onClick={handleSend}
					disabled={isDisabled} // Disabled för students i announcements
					className={`px-4 py-2 rounded-2xl ${isDisabled
						? 'bg-gray-400 cursor-not-allowed text-gray-100'
						: 'bg-green-500 text-white hover:bg-green-600'
						}`}>
					Send
				</button>

				{/* Knapp för att lämna chatroom */}
				<button
					onClick={quitChatRoom}
					className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600">
					Quit Chat Room
				</button>
			</div>
		</div>
	);
};

export default ChatBox;
