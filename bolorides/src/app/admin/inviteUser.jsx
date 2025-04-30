import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { setDoc, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore'; 

const InviteUser = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [message, setMessage] = useState('');

  const generateInviteLink = async () => {
    if (!auth.currentUser) {
      setMessage('You must be logged in to generate an invite link.');
      return;
    }

    const token = uuidv4(); 
    const inviterId = auth.currentUser.uid; 
    const inviterName = auth.currentUser.displayName || 'Unknown User'; 

    try {
      await setDoc(doc(db, 'Invitations', token), {
        inviterId,
        inviterName,
        createdAt: Timestamp.fromDate(new Date()), 
        used: false,
      });

      const link = `${window.location.origin}/Sign-up?token=${token}`;
      setInviteLink(link);
      setMessage(`Invite link generated! Copy this link: ${link}`);
    } catch (error) {
      console.error('Error generating invite link:', error);
      setMessage(`Failed to generate invite link: ${error.message}`);
    }
  };

  const copyToClipboard = () => {
    if (!inviteLink) return; // Prevent copying if no link is available

    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setMessage('Token link copied successfully!');
        setInviteLink(''); // Clear the invite link after copying
      })
      .catch((error) => {
        console.error('Failed to copy link:', error);
        setMessage('Failed to copy token link. Try again.');
      });

    // Clear the message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <div className="invite-user">
      <button onClick={generateInviteLink} className="bg-[#9b2f2f] text-white p-2 rounded mr-2">
        Invite Driver User
      </button>
      {inviteLink && (
        <div className="mt-4">
          <p>{message}</p>
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="border p-2 w-full"
          />
          <button onClick={copyToClipboard} className="bg-green-500 text-white p-2 rounded mt-2">
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteUser;