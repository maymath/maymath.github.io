// Header configuration
const headerConfig = {
    links: [
        { href: '/index.html', text: 'Main Home' },
        { href: 'homepage.html', text: 'Home' },
        { href: 'about.html', text: 'Who..' },
        { href: 'sunday_session.html', text: 'Sunday session at Fastnet Pub' },
        { href: 'links.html', text: 'Musical and Other Links' },
        { href: 'visitors.html', text: 'Interesting Visitors to the Fastnet Session' },
        { href: 'cd.html', text: 'Something Old Something New<br>New CD Music Album Information<br>August 2010' }
    ]
};

export const createHeader = () => {
    console.log('Creating header...');
    const header = document.createElement('div');
    header.className = 'header';
    
    headerConfig.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.innerHTML = link.text;
        header.appendChild(a);
    });
    
    // Try to insert at the very beginning of the body
    if (document.body) {
        document.body.insertBefore(header, document.body.firstChild);
        console.log('Header inserted into body');
    } else {
        console.error('Body not found when trying to insert header');
    }
}; 