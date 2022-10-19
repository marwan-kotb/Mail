
//document.querySelector('#compose-reply-view').style.display = 'none';
document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', getview);
  document.querySelector('#sent').addEventListener('click', getsent);
  document.querySelector('#archived').addEventListener('click', getarchive);
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Useing Add function when click Submit
  document.querySelector('#compose-form').onsubmit = Add
  
   

  // By default, load the inbox
  getview();
  load_mailbox('block', 'none', 'none', 'Inbox');
  
  
});

function compose_email() {


  // Show compose view and hide other views
  load_mailbox('none', 'block', 'none');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}
// Show the mailbox and hide other views
function load_mailbox(email_view, compose_view, compose_reply_view, h1) {
  h1view = document.querySelector('#emails-view');
  document.querySelector('#compose-reply-view').style.display = compose_reply_view;
  document.querySelector('#emails-view').style.display = email_view;
  document.querySelector('#compose-view').style.display = compose_view;
  document.querySelector('#emails-view').innerHTML = '';
  if(h1){
    h1view.style = 'font-size:35px';
    h1view.append(h1);
  }
  

}


  // Add email to db by api
  function Add() {
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    
}

// Insert replied email to api
function insertreply () {
  document.querySelector('#compose-reply-form').onsubmit = function () {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-reply-recipient').value,
        subject: document.querySelector('#compose-reply-subject').value,
        body: document.querySelector('#compose-reply-body').value 
      })
    })
  }
}

function reply_button (mail) {
  var button = document.createElement("BUTTON");
  button.innerHTML = "Reply";
     
  button.onclick = function () {
    load_mailbox('none', 'none', 'block');
    document.querySelector('#compose-reply-recipient').value = mail.sender;
    if (mail.subject.charAt(0) !== 'R' && mail.subject.charAt(1) !== 'e' && mail.subject.charAt(2) !== ':')
    {
      document.querySelector('#compose-reply-subject').value = `Re: ${mail.subject}`;
      
    }
    else
    {
      document.querySelector('#compose-reply-subject').value = mail.subject;
      
    }
    document.querySelector('#compose-reply-body').append(document.createElement('div').innerHTML = `On ${new Date().toUTCString()} ${mail.recipients} wrote: `);
    
    insertreply();
  }
  document.querySelector('#emails-view').appendChild(button);
}
// Insert in archive
function insertinarchive (mail, bool, name) {
  var button_archive = document.createElement("BUTTON");
      button_archive.innerHTML = name;
      button_archive.style = "float:right; background-color:yellow";
      document.querySelector('#emails-view').appendChild(button_archive);
      button_archive.onclick = function () {
        fetch(`/emails/${mail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: bool
          })
        })
      getview();
    }
    
}

function whenclickondiv(mail) {
  newdiv.addEventListener('click', function() {
    fetch(`/emails/${mail.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true

      })
      })
    let select = document.querySelector('#emails-view');
    select.innerHTML = '';
    let details = document.createElement('div');
    details.innerHTML = `<pre>
    From:${mail.sender}
    To:${mail.recipients}
    Subject:${mail.subject}
    Timestamp:${mail.timestamp}
    </pre>`
    select.append(details);
    reply_button(mail);
    select.append(document.createElement('div').innerHTML = mail.body);
  
  });
}

function getfromemailmailbox(address, fun) {
  fetch(address)
  .then(response => response.json())
  .then(result => {
    result.forEach(function (mail) {
      let newdiv = document.createElement('div');
      newdiv.innerHTML = `<pre>${mail.recipients}      ${mail.body}   ${mail.timestamp}</pre>`;   
      newdiv.style = "padding-bottom: 1em; border-style: outset; text-align: left; border: 1px solid black; padding:20px; font-style: italic; font-size: 18px;";               

      if (mail.read === true) {
        newdiv.style.backgroundColor = "lightgray";
      }
      else {
        newdiv.style.backgroundColor = "white";
      }
      if (fun){
        if (mail.archived === true){
          fun(mail, false, 'Unarchive');
        }
        else{
          fun(mail, true, 'Archive');
        }
        
      }
      
      document.querySelector('#emails-view').append(newdiv);
      newdiv.addEventListener('click', function() {
        fetch(`/emails/${mail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
    
          })
          })
        let select = document.querySelector('#emails-view');
        select.innerHTML = '';
        let details = document.createElement('div');
        details.innerHTML = 
        `<pre>
        From:${mail.sender}
        
        To:${mail.recipients}
        
        Subject:${mail.subject}
        
        Timestamp:${mail.timestamp}
        </pre>`
        details.style = 'font-size:25px;';
        select.append(details);
        reply_button(mail)
        body = document.createElement('div');
        body.innerHTML = 
        `<pre> Body:
      ${mail.body}</pre>`;
        body.style = 'padding-top:1em; font-size:30px; border-top: 1px solid lightgrey;';
        select.append(body);
      
      });

    })
  })
}

function getsent() {
  
  load_mailbox('block', 'none', 'none', 'Sent');
  getfromemailmailbox('/emails/sent');
  
        
}

function getview() {

  load_mailbox('block', 'none', 'none', 'Inbox');
  getfromemailmailbox('/emails/inbox', insertinarchive);
  
  
      
}


function getarchive () {
  load_mailbox('block', 'none', 'none', 'Archived');
  getfromemailmailbox('/emails/archive', insertinarchive);

}


        



    

























