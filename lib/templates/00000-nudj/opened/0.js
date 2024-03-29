const dedent = require('dedent')

module.exports = ({
  first_name,
  hash,
  campaign
}) => ({
  subject: 'How to hire 40% of your open roles through your employees networks',
  html: dedent`
    ${first_name ? `Hi ${first_name}` : 'Hey'},
    <br />
    <br />
    You probably opened my last email and thought ‘we already have an employee referral scheme, I don’t need another tool.’ But if 40% of your hires aren’t coming from employee referrals then your referral scheme isn’t working.
    <br />
    <br />
    The <a href="https://www.socialtalent.com/blog/recruitment/the-incredible-true-value-of-an-employee-referral-infographic">power of referrals</a> is well documented but implementing a successful scheme is notoriously tricky. Nudj strips out all the hassle of asking for, tracking and sourcing referrals from your company’s network. Helping you reach the elusive passive talent that aren’t looking on job boards or responding to cold recruiter outreach.
    <br />
    <br />
    <a href="https://blog.nudj.co/case-study-ditto-sustainability/?utm_source=sales&utm_medium=email&utm_campaign=${campaign}&utm_term=marcos">Ditto Sustainability</a> completely changed the way they hired once they started using nudj and you could to.
    <br />
    <br />
    To get started for free or to set up a demo head <a href="https://nudj.co/?utm_source=sales&utm_medium=email&utm_campaign=${campaign}&utm_term=marcos&m=${hash}">here</a>.
    <br />
    <br />
    Best,
    <br />
    <br />
    Robyn
    <br />
    <br />
    --
    <br />
    <br />
    Robyn McGirl
    <br />
    </br>
    Founder
    <br />
    07920549291
    <br />
    <br/>
    <div>
      <img src="https://drive.google.com/a/nudj.co/uc?id=0B0LAdd0A8p4jZWtEdjFfWW15NTg" width="96" height="96" />
      <br />
      <br />
      <small>If you don't want to hear any more about nudj, reply to this email and let me know</small>
    </div>
  `
})
