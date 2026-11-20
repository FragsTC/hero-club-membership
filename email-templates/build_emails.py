#!/usr/bin/env python3
"""Builds the Window Hero ServiceMinder email templates from one shared base.

Run:  python3 build_emails.py
Output goes to the emails/ folder next to this file.

Merge fields such as {contact.first_name} are passed through untouched,
so this file deliberately avoids str.format and f-strings.
"""
import os

NAVY = "#003b64"
GOLD = "#fcaf17"
GREY = "#4f5b66"
FONT = "font-family:Arial, Helvetica, sans-serif;"
IMG = "https://d1m4vp65okes21.cloudfront.net/t/o/2034/e/"
YEAR = "2026"


# ---------- building blocks ----------

def spacer(h=24):
    h = str(h)
    return ('<tr><td height="' + h + '" style="height:' + h +
            'px; font-size:0; line-height:0;">&nbsp;</td></tr>')


def card(inner, bg, border=None, align="left", color=GREY, gap=24):
    """A rounded box. Built as a table so Outlook keeps the padding."""
    b = (" border:1px solid " + border + ";") if border else ""
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">'
        '<tr><td class="card" align="' + align + '" bgcolor="' + bg + '" style="background-color:' + bg + ';' + b +
        ' border-radius:8px; padding:24px; ' + FONT + ' font-size:16px; line-height:1.6; color:' + color +
        '; text-align:' + align + ';">' + inner + '</td></tr>' + spacer(gap) + '</table>'
    )


def callout(inner, top=0):
    """White note with a gold left edge."""
    pre = spacer(top) if top else ""
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + pre +
        '<tr><td bgcolor="#ffffff" style="background-color:#ffffff; border-left:4px solid ' + GOLD +
        '; padding:14px 16px; ' + FONT + ' font-size:15px; line-height:1.6; color:' + GREY +
        '; text-align:left;">' + inner + '</td></tr></table>'
    )


def button(href, label, size=20, bg=GOLD, fg=NAVY, newtab=True):
    """Button that keeps its shape in desktop Outlook (padding lives on the cell there)."""
    t = ' target="_blank" rel="noopener noreferrer"' if newtab else ""
    s = str(size)
    return (
        '<table role="presentation" class="btn" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">'
        '<tr><td align="center" bgcolor="' + bg + '" style="background-color:' + bg +
        '; border-radius:6px; mso-padding-alt:15px 30px;">'
        '<a href="' + href + '"' + t + ' style="display:inline-block; padding:15px 30px; ' + FONT +
        ' font-size:' + s + 'px; line-height:1.2; font-weight:bold; color:' + fg +
        '; text-decoration:none; border-radius:6px;">' + label + '</a></td></tr></table>'
    )


def heading(text, size=22, color=NAVY, align="center", mb=16, tag="h2", cls=""):
    c = (' class="' + cls + '"') if cls else ""
    return ('<' + tag + c + ' style="margin:0 0 ' + str(mb) + 'px 0; ' + FONT + ' font-size:' + str(size) +
            'px; line-height:1.25; font-weight:bold; color:' + color + '; text-align:' + align + ';">' +
            text + '</' + tag + '>')


def p(text, mb=10, color=None, size=None, align=None, lh=None):
    st = "margin:0 0 " + str(mb) + "px 0;"
    if color:
        st += " color:" + color + ";"
    if size:
        st += " font-size:" + str(size) + "px;"
    if align:
        st += " text-align:" + align + ";"
    if lh:
        st += " line-height:" + str(lh) + ";"
    return '<p style="' + st + '">' + text + '</p>'


def greeting():
    return p("Hey {contact.first_name},", mb=10, color=NAVY, size=18)


def footer(tagline, extra=""):
    link = 'style="color:' + GOLD + '; text-decoration:underline;"'
    return (
        '<tr><td class="px" align="center" bgcolor="' + NAVY + '" style="background-color:' + NAVY +
        '; padding:34px 24px 38px 24px; ' + FONT + ' text-align:center;">'
        '<img src="' + IMG + '141668-WH_Logo_WH_Logo_White.png" width="255" alt="Window Hero" '
        'style="display:block; width:255px; max-width:100%; height:auto; border:0; margin:0 auto 16px auto;">'
        + p("Need Assistance?", mb=12, color=GOLD, size=24) .replace('<p style="', '<p style="font-weight:bold; ')
        + p(tagline, mb=22, color="#ffffff", size=16, lh=1.6)
        + extra
        + button("tel:{organization.phone}", "&#128222; {organization.phone}", size=22, newtab=False)
        + '<p style="margin:28px 0 0 0; color:#ffffff; font-size:12px; line-height:1.5;">&copy; ' + YEAR +
        ' Window Hero | 107 Parr Drive, Huntersville, NC 28078, United States</p>'
        '<p style="margin:0 0 24px 0; color:#ffffff; font-size:12px; line-height:1.5;">All Rights Reserved | Franchises Available</p>'
        '<p style="margin:0; color:' + GOLD + '; font-size:12px; line-height:1.5;">'
        '<a href="{unsubscribe.url}" ' + link + '>Unsubscribe</a> | '
        '<a href="https://windowhero.com/terms-conditions/" target="_blank" ' + link + '>Terms &amp; Conditions</a> | '
        '<a href="https://windowhero.com/privacy-policy/" target="_blank" ' + link + '>Privacy Policy</a></p>'
        '</td></tr>'
    )


def page(title, preheader, body, foot):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>''' + title + '''</title>
<style>
body { margin:0; padding:0; }
img { border:0; outline:none; text-decoration:none; }
@media only screen and (max-width:600px) {
  .outer { padding:0 !important; }
  .px { padding-left:16px !important; padding-right:16px !important; }
  .card { padding:20px 16px !important; }
  .stack { display:block !important; width:100% !important; box-sizing:border-box !important; }
  .photo { padding:0 0 14px 0 !important; border-right:0 !important; text-align:center !important; }
  .photo img { margin:0 auto !important; }
  .details { padding:0 !important; text-align:center !important; }
  .h1 { font-size:24px !important; }
  .btn a { font-size:18px !important; padding:14px 20px !important; }
}
</style>
</head>
<body bgcolor="#f4f6f9" style="margin:0; padding:0; background-color:#f4f6f9;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f6f9; opacity:0;">''' + preheader + '''</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f9" style="background-color:#f4f6f9;">
<tr><td class="outer" align="center" style="padding:20px 10px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%; max-width:600px; background-color:#ffffff;">
<tr><td align="center" bgcolor="''' + NAVY + '''" style="background-color:''' + NAVY + '''; padding:20px;"><img src="''' + IMG + '''141668-WH_Emailhead_2.jpg" width="515" alt="Window Hero" style="display:block; width:100%; max-width:515px; height:auto; border:0; margin:0 auto;"></td></tr>
<tr><td class="px" style="padding:30px 30px 6px 30px; ''' + FONT + ''' font-size:16px; line-height:1.6; color:''' + GREY + '''; background-color:#ffffff;">
''' + body + '''
</td></tr>
''' + foot + '''
</table>
</td></tr>
</table>
</body>
</html>
'''


def check_rows(items, color, size=16, cols=2, align="left", pad="6px 10px"):
    """Tick list. Two columns on desktop, one on phones."""
    w = str(100 // cols) + "%"
    out = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    for i, item in enumerate(items):
        if i and i % cols == 0:
            out += '</tr><tr>'
        cls = ' class="stack"' if cols > 1 else ""
        out += ('<td' + cls + ' width="' + w + '" valign="top" style="padding:' + pad + '; ' + FONT +
                ' font-size:' + str(size) + 'px; line-height:1.5; color:' + color + '; text-align:' + align +
                ';">&#10003; ' + item + '</td>')
    return out + '</tr></table>'


# ---------- 1. Service complete ----------

def service_complete():
    b = greeting() + spacer_block(8)

    b += card(
        heading("Your Service Is Complete", size=28, color="#ffffff", mb=12, tag="h1", cls="h1") +
        p("Our team has completed your Window Hero service. Below is a quick summary of today&rsquo;s visit and a few helpful notes.",
          mb=0, color="#ffffff", size=17, lh=1.7),
        NAVY, align="center", color="#ffffff")

    b += card(
        heading("Service Summary", mb=18) +
        p("<strong>Property:</strong> {fullserviceaddress}", color=NAVY) +
        p("<strong>Service Completed:</strong> {appointment.parts_list}", color=NAVY) +
        p("<strong>Completed On:</strong> {appointment.actualfinish}", color=NAVY) +
        p("<strong>Completed By:</strong> {service_agent.names}", mb=0, color=NAVY),
        "#fff9e8", border="#f1d38a")

    def note(title, text, mb=12):
        return p('<strong style="color:' + NAVY + ';">' + title + '</strong><br>' + text, mb=mb)

    b += card(
        heading("What to Expect After Your Service", size=24, mb=18) +
        callout("Every property is different, but the following are completely normal after today&rsquo;s service:") +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + spacer(18) + '</table>' +
        note("&#128167; Surfaces May Continue Drying",
             "Windows, siding, concrete, and other exterior surfaces may remain damp for several hours after service depending on weather conditions.") +
        note("&#127807; Landscaping Was Protected",
             "As part of every service, we thoroughly rinse surrounding landscaping before, during, and after cleaning. Some plants may still appear wet for a short time.") +
        note("&#127968; Some Organic Stains Continue Improving",
             "For roof washing and soft washing services, certain algae, mildew, moss, and organic staining may continue breaking down over the next several days as the treatment finishes working.") +
        note("&#129695; Windows Look Best Once Fully Dry",
             "If your service included window cleaning, allow the glass to dry completely before evaluating the final results. Small water droplets or damp edges during drying are normal.") +
        note("&#128703; Please Avoid Sprinklers Today",
             "If possible, keep irrigation systems off until tomorrow so freshly cleaned surfaces have time to dry and cure properly.") +
        note("&#128522; Questions? Just Ask.",
             "If anything doesn&rsquo;t meet your expectations, please contact us within the next few days. We&rsquo;re happy to answer questions or return if something needs our attention.", mb=0),
        "#f7f9fc", border="#d9e2ec")

    b += card(
        heading("Your Satisfaction Is Our Priority", size=26, color="#ffffff", mb=16) +
        p("Our team is happy to answer questions, discuss the service performed, or schedule a touch-up if needed.",
          mb=22, color="#ffffff") +
        button("tel:{organization.phone}", "&#128222; Contact Our Team", newtab=False),
        NAVY, align="center", color="#ffffff")

    b += card(
        heading("Be The Hero of Your Home!", size=24, mb=14) +
        p("Join the <strong>Hero Club</strong> and enjoy the convenience of scheduled maintenance, exclusive member savings, and priority scheduling.",
          mb=10, align="center", lh=1.8) +
        p("Plans starting at just $59/month", mb=22, color=NAVY, size=22, align="center").replace(
            '<p style="', '<p style="font-weight:bold; ') +
        check_rows(["Exclusive Member Discounts", "Priority Scheduling",
                    "Bronze, Silver &amp; Gold Memberships", "Automatic Service Reminders",
                    "Customized Maintenance Plans", "Annual Price Protection"], NAVY) +
        callout("<strong>Hero Club members receive annual price protection,</strong> meaning your membership pricing is locked in for the year, helping you avoid seasonal price increases while keeping your home looking its best.", top=22) +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + spacer(22) + '</table>' +
        button("https://windowhero.com/hero-club/", "Explore Hero Club Membership", size=17, bg=NAVY, fg="#ffffff"),
        "#f7f9fc", border="#d9e2ec")

    b += p("Thank you again for choosing {organization.name}. We appreciate your trust and look forward to serving you again.",
           mb=24, color=NAVY, align="center", lh=1.8)

    return page("Your Window Hero service is complete",
                "A quick summary of today&rsquo;s visit and what to expect next.",
                b,
                footer("Questions about your completed service? We&rsquo;re here to help."))


def spacer_block(h):
    return ('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
            spacer(h) + '</table>')


def proposal_cta(title, text, extra=""):
    return card(
        heading(title, size=28, color="#ffffff", mb=14, tag="h1", cls="h1") +
        p(text, mb=24, color="#ffffff", size=17, lh=1.7) +
        button("{proposal.url}", "Review &amp; Approve Proposal") +
        '<p style="margin:18px 0 0 0; color:#ffffff; font-size:13px;">No login required.</p>'
        '<p style="margin:12px 0 0 0; color:#ffffff; font-size:14px;"><a href="{proposal.pdf_url}" target="_blank" rel="noopener noreferrer" style="color:#ffffff; text-decoration:underline;">Download PDF Version</a></p>'
        + extra,
        NAVY, align="center", color="#ffffff")


PHONE = '<a href="tel:+19197464485" style="color:' + NAVY + '; text-decoration:none;">919-746-4485</a>'
EMAIL = '<a href="mailto:{organization.email}" style="color:' + NAVY + '; text-decoration:underline;">{organization.email}</a>'


# ---------- 2. Commercial proposal ----------

def commercial_proposal():
    b = greeting()
    b += p("Thank you for the opportunity to earn your business. We&rsquo;ve prepared a customized proposal specifically for your property that outlines our recommended scope of work, project details, and pricing. Please review the information below, and let us know if you&rsquo;d like to make any adjustments before approving.",
           mb=24, color=NAVY, size=18, lh=1.7)

    b += card(
        heading("Proposal at a Glance", mb=18) +
        p("<strong>Project:</strong> {proposal.title}", color=NAVY) +
        p("<strong>Property:</strong> {fullserviceaddress}", color=NAVY) +
        p("<strong>Services:</strong> {proposal.parts_list}", color=NAVY) +
        p("<strong>Proposal Total:</strong> {proposal.total}", color=NAVY) +
        p("<strong>Valid Through:</strong> {proposal.expiration-date|short_date}", mb=16, color=NAVY) +
        callout("Need revisions? We can adjust the scope, scheduling, or services before approval to fit your property&rsquo;s needs."),
        "#fff9e8", border="#f1d38a")

    b += proposal_cta("Your Commercial Proposal Is Ready",
                      "Review the complete scope of work, pricing, and service recommendations using the button below.")

    manager = (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        '<td class="stack photo" width="130" align="center" valign="middle" style="padding:0 18px 0 0; border-right:1px solid #d9e2ec;">'
        '<img src="https://i.ibb.co/93qWBvq1/0-CF16098-D4-F9-4684-AF90-45318-CCDA3-D8.png" width="100" height="100" alt="" '
        'style="display:block; width:100px; height:100px; border-radius:50px; border:3px solid ' + NAVY + ';"></td>'
        '<td class="stack details" valign="middle" style="padding:0 0 0 22px; ' + FONT + ' text-align:left;">'
        '<p style="margin:0 0 4px 0; color:' + NAVY + '; font-size:24px; line-height:1.2; font-weight:bold;">{proposal.owner_name}</p>'
        '<p style="margin:0 0 14px 0; color:#5d6773; font-size:15px; line-height:1.4;">Director of Sales &amp; Operations</p>'
        '<p style="margin:0 0 8px 0; color:' + NAVY + '; font-size:16px; line-height:1.4;"><strong>Call/Text:</strong> ' + PHONE + '</p>'
        '<p style="margin:0; color:' + NAVY + '; font-size:16px; line-height:1.4; word-break:break-word;"><strong>Email:</strong> ' + EMAIL + '</p>'
        '</td></tr></table>'
    )
    b += card(
        heading("Your Dedicated Project Manager", size=24, mb=12) +
        p("I&rsquo;m here to answer questions, review your proposal, discuss modifications, and help coordinate your project from start to finish.",
          mb=22, color="#5d6773", size=15, align="center", lh=1.7) +
        manager,
        "#ffffff", border="#d9e2ec")

    b += p("We appreciate the opportunity to earn your business and look forward to becoming your trusted exterior cleaning partner.",
           mb=24, color=NAVY, align="center", lh=1.8)

    services = (
        heading("Commercial Exterior Cleaning Services", size=20, color=GOLD, mb=12, tag="h3") +
        '<table role="presentation" align="center" width="460" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:460px; margin:0 auto;"><tr><td>' +
        check_rows(["Window Cleaning", "Roof Washing", "Pressure Washing", "Service Plans",
                    "Building Soft Washing", "Drone Window Cleaning",
                    "Parking Garage Cleaning", "Drone Pressure Washing"],
                   "#ffffff", size=14, align="center", pad="5px 8px").replace(' class="stack"', '') +
        '</td></tr>' + spacer(24) + '</table>'
    )

    return page("Your Window Hero commercial proposal",
                "Your customized commercial proposal is ready to review and approve.",
                b,
                footer("Our team is here to help.", extra=services))


# ---------- 3. Residential proposal ----------

def residential_proposal():
    b = greeting()
    b += p("Thank you for the opportunity to earn your business. We&rsquo;ve prepared a personalized Window Hero proposal for your property.",
           mb=24, color=NAVY, size=18, lh=1.7)

    b += card(
        heading("Your Proposal at a Glance", mb=18) +
        p("<strong>Property:</strong> {fullserviceaddress}", mb=8, color=NAVY) +
        p("<strong>Services:</strong> {proposal.parts_list}", mb=8, color=NAVY) +
        p("<strong>Proposal Total:</strong> {proposal.total}", mb=8, color=NAVY) +
        p("<strong>Proposal Valid Through:</strong> {proposal.expiration-date|short_date}", mb=14, color=NAVY) +
        callout("Your proposal is completely customizable. If you&rsquo;d like to add, remove, or modify any services, just let us know before approving."),
        "#fff9e8", border="#f1d38a")

    steps = (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + spacer(24) +
        '<tr><td height="1" bgcolor="#406c8b" style="height:1px; font-size:0; line-height:0; background-color:#406c8b;">&nbsp;</td></tr>' +
        spacer(24) + '</table>' +
        heading("What Happens Next?", size=22, color="#ffffff", mb=12, tag="h2") +
        check_rows(["Review your personalized proposal online.",
                    "Approve your proposal with just a few clicks.",
                    "Our team will contact you to schedule a convenient service date.",
                    "Sit back while Window Hero delivers professional, hassle-free results."],
                   "#ffffff", cols=1, pad="7px 0")
    )
    b += proposal_cta("Your Proposal Is Ready",
                      "Review your personalized proposal, approve it online, and we&rsquo;ll take care of the rest. It only takes a minute to get started.",
                      extra=steps)

    b += card(
        heading("Questions About Your Proposal?", align="left", mb=10) +
        p("We&rsquo;re happy to walk through your proposal, discuss options, or make any adjustments before scheduling.", mb=14, lh=1.7) +
        p("<strong>Your Dedicated Contact:</strong> {proposal.owner_name}", mb=8, color=NAVY) +
        p("<strong>Call/Text:</strong> " + PHONE, mb=8, color=NAVY) +
        '<p style="margin:0; color:' + NAVY + '; word-break:break-word;"><strong>Email:</strong> ' + EMAIL + '</p>',
        "#ffffff", border="#d9e2ec")

    b += card(
        heading("Why Homeowners Choose Window Hero", align="left", mb=10) +
        check_rows(["Professional, fully insured service",
                    "Friendly and highly trained technicians",
                    "Industry-leading equipment and cleaning methods",
                    "Clear communication from estimate to completion"],
                   NAVY, cols=1, pad="4px 0"),
        "#f7f9fc", border="#d9e2ec")

    b += p("We truly appreciate the opportunity to earn your business and look forward to serving you. If you have any questions before making your decision, our team is always happy to help.",
           mb=24, color=NAVY, align="center", lh=1.8)

    return page("Your Window Hero proposal",
                "Your personalized proposal is ready to review and approve online.",
                b,
                footer("Have a question about your proposal? We&rsquo;re here to help."))


# ---------- shared pieces for the newer templates ----------

def hero(title, text, extra=""):
    return card(
        heading(title, size=28, color="#ffffff", mb=12, tag="h1", cls="h1") +
        p(text, mb=(24 if extra else 0), color="#ffffff", size=17, lh=1.7) + extra,
        NAVY, align="center", color="#ffffff")


def white_link(href, label, top=16):
    return ('<p style="margin:' + str(top) + 'px 0 0 0; color:#ffffff; font-size:14px;"><a href="' + href +
            '" target="_blank" rel="noopener noreferrer" style="color:#ffffff; text-decoration:underline;">' +
            label + '</a></p>')


def summary(title, rows, note=None):
    inner = heading(title, mb=18)
    last = len(rows) - 1
    for i, (k, v) in enumerate(rows):
        inner += p("<strong>" + k + ":</strong> " + v, mb=(10 if (i < last or note) else 0), color=NAVY)
    if note:
        inner += callout(note, top=6)
    return card(inner, "#fff9e8", border="#f1d38a")


def ticks(title, items):
    return card(heading(title, align="left", mb=10) + check_rows(items, NAVY, cols=1, pad="4px 0"),
                "#f7f9fc", border="#d9e2ec")


def intro(text):
    return p(text, mb=24, color=NAVY, size=18, lh=1.7)


def closing(text):
    return p(text, mb=24, color=NAVY, align="center", lh=1.8)


PREP = ["Close all windows and exterior doors.",
        "Move vehicles, patio furniture, and fragile items away from the work area.",
        "Unlock gates so our team can reach every side of the property.",
        "Keep pets indoors while we work.",
        "Make sure an outdoor water spigot is available and turned on."]


# ---------- 4. Appointment confirmation (ServiceMinder: Appointment Confirmation) ----------

def appointment_confirmation():
    b = greeting() + intro("Thank you for choosing Window Hero. Your appointment is booked, and the details are below.")
    b += hero("You&rsquo;re On the Schedule",
              "We&rsquo;ve reserved your spot. Please confirm your appointment so our team knows you&rsquo;re all set.",
              button("{appointment.confirm_url}", "Confirm Appointment") +
              white_link("{appointment.ical_download_url}", "Add to Calendar"))
    b += summary("Appointment Details",
                 [("When", "{appointment.date}"),
                  ("Property", "{fullserviceaddress}"),
                  ("Services", "{appointment.parts_list}"),
                  ("Estimated Length", "{appointment.duration}"),
                  ("Your Team", "{service_agent.names}")],
                 note="Need to change something? Contact us and we&rsquo;ll find a time that works.")
    b += ticks("How to Prepare", PREP)
    b += closing("We appreciate your business and look forward to seeing you soon.")
    return page("Your Window Hero appointment is confirmed",
                "Your appointment is booked. Here are the details and how to prepare.",
                b, footer("Questions about your appointment? We&rsquo;re here to help."))


# ---------- 5. Appointment reminder (contact shortcodes, so it works in any template type) ----------

def appointment_reminder():
    b = greeting() + intro("This is a friendly reminder that your Window Hero service is coming up.")
    b += hero("Your Appointment Is Coming Up",
              "Our team is getting ready for your visit. Take a moment to review the details below.",
              button("{contact.next_appointment_link}", "View Appointment"))
    b += summary("Appointment Details",
                 [("When", "{contact.next_appointment_date} at {contact.next_appointment_time}"),
                  ("Property", "{fullserviceaddress}"),
                  ("Service", "{contact.next_appointment_summary}")],
                 note="Need to reschedule? Contact us as soon as possible and we&rsquo;ll find a new time.")
    b += ticks("Before We Arrive", PREP)
    b += closing("Thank you for choosing {organization.name}. We&rsquo;ll see you soon.")
    return page("Reminder: your Window Hero appointment",
                "Your Window Hero service is coming up. Here is what to expect.",
                b, footer("Questions about your appointment? We&rsquo;re here to help."))


# ---------- 6. On our way (ServiceMinder: Service Agent En Route) ----------

def on_our_way():
    b = greeting()
    b += hero("We&rsquo;re On Our Way",
              "{service_agent.name} is heading to your property now.",
              button("{appointment.tracking_url}", "Track Our Arrival"))
    b += summary("Arrival Details",
                 [("Estimated Arrival", "{appointment.arrival_time}"),
                  ("Drive Time", "{drivetime}"),
                  ("Your Team", "{service_agent.names}"),
                  ("Property", "{fullserviceaddress}")])
    b += ticks("Before We Arrive",
               ["Close all windows and exterior doors.",
                "Unlock gates so our team can reach every side of the property.",
                "Keep pets indoors while we work."])
    b += closing("You don&rsquo;t need to be home for most exterior services. If anything has changed, please call us right away.")
    return page("Window Hero is on the way",
                "Your Window Hero team is heading to your property now.",
                b, footer("Need to reach us before we arrive? We&rsquo;re here to help."))


# ---------- 7. Reschedule or weather delay (ad hoc; send after moving the appointment) ----------

def reschedule_notice():
    b = greeting()
    b += hero("We Need to Move Your Appointment",
              "Because of weather or conditions outside our control, we&rsquo;ve had to reschedule your Window Hero service. We&rsquo;re sorry for the inconvenience.")
    b += summary("Your Updated Appointment",
                 [("New Date", "{contact.next_appointment_date} at {contact.next_appointment_time}"),
                  ("Property", "{fullserviceaddress}"),
                  ("Service", "{contact.next_appointment_summary}")],
                 note="If the new time doesn&rsquo;t work for you, contact us and we&rsquo;ll find one that does.")
    b += spacer_block(0) + button("{contact.next_appointment_link}", "View Appointment", size=18, bg=NAVY, fg="#ffffff") + spacer_block(24)
    b += ticks("Why We Reschedule",
               ["Rain and high winds affect the quality of your results.",
                "Lightning and wet surfaces put our team at risk.",
                "We would rather return on a better day than deliver less than our best."])
    b += closing("Thank you for your patience and understanding. We look forward to serving you.")
    return page("Your Window Hero appointment has been rescheduled",
                "We&rsquo;ve had to move your appointment. Here is your new date.",
                b, footer("Questions about your new appointment? We&rsquo;re here to help."))


# ---------- 8. Proposal follow-up (ServiceMinder: Proposal Reminder) ----------

def proposal_follow_up():
    b = greeting() + intro("We wanted to follow up on the proposal we prepared for your property. It&rsquo;s still available, and we&rsquo;re happy to answer questions or make changes.")
    b += summary("Your Proposal at a Glance",
                 [("Property", "{fullserviceaddress}"),
                  ("Services", "{proposal.parts_list}"),
                  ("Proposal Total", "{proposal.total}"),
                  ("Valid Through", "{proposal.expiration-date|short_date}")])
    b += proposal_cta("Your Proposal Is Still Available",
                      "Review and approve it online whenever you&rsquo;re ready. It only takes a minute.")
    b += card(
        heading("Questions or Changes?", align="left", mb=10) +
        p("If something in the proposal isn&rsquo;t quite right, we can adjust the scope, services, or scheduling before you approve.", mb=14, lh=1.7) +
        p("<strong>Your Dedicated Contact:</strong> {proposal.owner_name}", mb=8, color=NAVY) +
        p("<strong>Call/Text:</strong> " + PHONE, mb=8, color=NAVY) +
        '<p style="margin:0; color:' + NAVY + '; word-break:break-word;"><strong>Email:</strong> ' + EMAIL + '</p>',
        "#ffffff", border="#d9e2ec")
    b += closing("Thank you again for the opportunity to earn your business.")
    return page("Following up on your Window Hero proposal",
                "Your proposal is still available to review and approve online.",
                b, footer("Have a question about your proposal? We&rsquo;re here to help."))


# ---------- 9. Invoice (ServiceMinder: Contact Invoice) ----------

def invoice():
    b = greeting() + intro("Thank you for choosing Window Hero. Your invoice is ready to view and pay online.")
    b += hero("Your Invoice Is Ready",
              "Review your invoice and pay securely online using the button below.",
              button("{url}", "View &amp; Pay Invoice") +
              white_link("{invoice.pdf_url}", "Download PDF Version"))
    b += summary("Invoice Summary",
                 [("Invoice Number", "{invoice.number}"),
                  ("Invoice Date", "{invoice.date}"),
                  ("Property", "{fullserviceaddress}"),
                  ("Services", "{invoice.parts_list}"),
                  ("Invoice Total", "{invoice.total}"),
                  ("Balance Due", "{invoice.balancedue}")],
                 note="Questions about this invoice? Contact us and we&rsquo;ll be glad to help.")
    b += closing("Thank you for your business. We appreciate your trust in {organization.name}.")
    return page("Your Window Hero invoice",
                "Your invoice is ready to view and pay online.",
                b, footer("Questions about your invoice? We&rsquo;re here to help."))


# ---------- 10. Payment receipt (ServiceMinder: Contact Receipt) ----------

def receipt():
    b = greeting()
    b += hero("Payment Received. Thank You!",
              "We&rsquo;ve received your payment. A summary is below for your records.",
              button("{url}", "View Receipt"))
    b += summary("Payment Summary",
                 [("Invoice Number", "{invoice.number}"),
                  ("Amount Paid", "{invoice.latest_payment_amount}"),
                  ("Total Paid", "{invoice.total_paid}"),
                  ("Remaining Balance", "{invoice.balancedue}")])
    b += p("{receipt_message}", mb=24, color=NAVY, align="center")
    b += closing("Thank you for choosing {organization.name}. We look forward to serving you again.")
    return page("Your Window Hero payment receipt",
                "We&rsquo;ve received your payment. Thank you!",
                b, footer("Questions about your payment? We&rsquo;re here to help."))


# ---------- Hero Club emails ----------
#
# What each plan includes is read from the signup page, so these emails cannot
# drift from it. Amounts that ServiceMinder cannot fill in (it has no
# membership shortcodes) are written as [CAPITALS IN BRACKETS] for the office
# to type over before sending. Square brackets are not shortcodes, so they
# print exactly as written if someone forgets.

def load_tiers():
    import json
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "..", "public", "index.html"), encoding="utf-8") as f:
        html = f.read()
    start = html.index("var TIERS = {")
    end = html.index("\n};", start)
    return json.loads(html[html.index("{", start):end + 2])


def fillin(label):
    """A value the office types in by hand before sending."""
    return "<strong>[" + label + "]</strong>"


def esc(text):
    return text.replace("&", "&amp;")


GUARANTEE = ("<strong>Not happy with something?</strong> Tell us within 7 days of a visit and "
             "we&rsquo;ll come back and fix it at no charge.")

REFERRAL_SMALL = ("Their twelfth month is free, and you get a credit on your bill worth their monthly charge, "
                  "up to one month of your own plan, once they&rsquo;ve paid their down payment and first monthly charge.")


# ---------- HC 1. Welcome, one per plan (ad hoc; contact shortcodes only) ----------

def hero_club_welcome(tier_id):
    def build():
        t = load_tiers()[tier_id]
        included = [esc(s) for s in t["services"] if "off any additional" not in s]
        b = greeting()
        b += hero("Welcome to the Hero Club!",
                  "Thank you for becoming a " + t["name"] + " member. Your home is now on a plan that keeps it looking its best all year, without you having to call.")
        note = esc(t["note"]) + "." if t.get("note") else None
        inner = heading("Your " + t["name"] + " Plan", size=24, mb=6)
        inner += p("Over your 12 months, your membership includes:", mb=14, align="center")
        inner += check_rows(included, NAVY, cols=1, pad="4px 0")
        inner += callout("<strong>" + t["discount"] + " off any additional service</strong> you ask for during your membership."
                         + ((" " + note) if note else ""), top=18)
        b += card(inner, "#fff9e8", border="#f1d38a")
        b += card(
            heading("What Happens Next?", size=22, color="#ffffff", mb=12) +
            check_rows(["We schedule each visit within its season and confirm the date with you ahead of time.",
                        "You get a reminder before every visit.",
                        "Our team does the work and sends you a summary when it&rsquo;s complete."],
                       "#ffffff", cols=1, pad="7px 0") +
            spacer_block(18) +
            button("{contact.schedule_url}", "View My Schedule") +
            white_link("{contact.update_payment_url}", "Update Payment Method"),
            NAVY, align="center", color="#ffffff")
        b += ticks("Good to Know",
                   ["Your monthly charge runs on the same day each month, to the card on file.",
                    "Your price is locked for your 12 months.",
                    "If weather gets in the way, we move your visit. You never lose it.",
                    "Tell us within 7 days if anything about a visit isn&rsquo;t right, and we&rsquo;ll come back and fix it at no charge."])
        b += card(
            heading("Give a Month, Get a Month", mb=10) +
            p("If a neighbor joins the Hero Club and gives us your name and street address, you each get a month free.",
              mb=10, align="center", color=NAVY) +
            p(REFERRAL_SMALL, mb=0, align="center", size=14),
            "#f7f9fc", border="#d9e2ec")
        b += closing("Thank you for trusting {organization.name} with your home. We&rsquo;re glad to have you in the Hero Club.")
        return page("Welcome to the Hero Club",
                    "Your " + t["name"] + " membership is active. Here is what&rsquo;s included and what happens next.",
                    b, footer("Questions about your membership? We&rsquo;re here to help."))
    return build


# ---------- HC 2. Proposal follow-up (ad hoc, proposal type) ----------

def hero_club_proposal_follow_up():
    b = greeting() + intro("We wanted to follow up on your Hero Club membership. Your spot is still open, and we&rsquo;re happy to answer any questions before you join.")
    b += summary("Your Membership at a Glance",
                 [("Property", "{fullserviceaddress}"),
                  ("Plan", "{proposal.parts_list}"),
                  ("Total for the Year", "{proposal.total}")],
                 note="Paid as a down payment today and 12 monthly charges. The amounts are shown when you open your membership below.")
    b += card(
        heading("Your Hero Club Membership Is Ready", size=28, color="#ffffff", mb=14, tag="h1", cls="h1") +
        p("Review your membership agreement and join online. It only takes a few minutes.", mb=24, color="#ffffff", size=17, lh=1.7) +
        button("{proposal.url}", "Review &amp; Join") +
        '<p style="margin:18px 0 0 0; color:#ffffff; font-size:13px;">No login required.</p>',
        NAVY, align="center", color="#ffffff")
    b += ticks("What Members Get",
               ["Your gutter, house wash and window visits scheduled for you.",
                "One monthly price, locked for 12 months.",
                "A member discount on any additional service.",
                "If a visit isn&rsquo;t right, we come back and fix it at no charge."])
    b += card(
        heading("Questions First?", align="left", mb=10) +
        p("We&rsquo;re glad to walk through the plan or change it before you join.", mb=14, lh=1.7) +
        p("<strong>Your Contact:</strong> {proposal.owner_name}", mb=8, color=NAVY) +
        p("<strong>Call/Text:</strong> " + PHONE, mb=8, color=NAVY) +
        '<p style="margin:0; color:' + NAVY + '; word-break:break-word;"><strong>Email:</strong> ' + EMAIL + '</p>',
        "#ffffff", border="#d9e2ec")
    b += closing("Thank you for considering the Hero Club. We&rsquo;d love to take care of your home.")
    return page("Your Hero Club membership is waiting",
                "Your Hero Club membership is ready to review and join online.",
                b, footer("Have a question about the Hero Club? We&rsquo;re here to help."))


# ---------- HC 3. Visit reminder (contact shortcodes, any template type) ----------

def hero_club_visit_reminder():
    b = greeting() + intro("Your next Hero Club visit is coming up. There&rsquo;s nothing you need to do but get ready for a cleaner home.")
    b += hero("Your Hero Club Visit Is Coming Up",
              "Our team is getting ready for your visit. The details are below.",
              button("{contact.next_appointment_link}", "View Appointment"))
    b += summary("Visit Details",
                 [("When", "{contact.next_appointment_date} at {contact.next_appointment_time}"),
                  ("Property", "{fullserviceaddress}"),
                  ("Service", "{contact.next_appointment_summary}")],
                 note="This visit is part of your Hero Club membership, so your plan services are already covered.")
    b += ticks("Before We Arrive", PREP)
    b += closing("Need a different day? Contact us as soon as you can and we&rsquo;ll find a new time. You never lose a visit.")
    return page("Reminder: your Hero Club visit",
                "Your Hero Club visit is coming up. Here is what to expect.",
                b, footer("Questions about your visit? We&rsquo;re here to help."))


# ---------- HC 4. Visit complete, with the referral ask (ad hoc, appointment type) ----------

def hero_club_visit_complete():
    b = greeting() + spacer_block(8)
    b += hero("Your Hero Club Visit Is Complete",
              "Our team has finished today&rsquo;s visit. A quick summary is below.")
    b += summary("Visit Summary",
                 [("Property", "{fullserviceaddress}"),
                  ("Service Completed", "{appointment.parts_list}"),
                  ("Completed On", "{appointment.actualfinish}"),
                  ("Completed By", "{service_agent.names}")],
                 note="Your plan services are covered by your membership. Any add-on you asked for is billed separately at your member discount.")
    b += card(callout(GUARANTEE), "#f7f9fc", border="#d9e2ec")
    b += card(
        heading("Give a Month, Get a Month", size=24, color="#ffffff", mb=12) +
        p("If a neighbor asks who did your home, have them give us your name and street address when they join the Hero Club. You each get a month free.",
          mb=14, color="#ffffff", size=17, lh=1.7) +
        p(REFERRAL_SMALL, mb=0, color="#ffffff", size=14),
        NAVY, align="center", color="#ffffff")
    b += closing("Thank you for being a Hero Club member. We&rsquo;ll see you at your next visit.")
    return page("Your Hero Club visit is complete",
                "Today&rsquo;s Hero Club visit is done. Here is a quick summary.",
                b, footer("Questions about today&rsquo;s visit? We&rsquo;re here to help."))


# ---------- HC 5. Payment failed, day 1 (ServiceMinder: Installment Payment Failure) ----------

def hero_club_payment_failed():
    b = greeting()
    b += hero("We Couldn&rsquo;t Process Your Payment",
              "Your Hero Club payment didn&rsquo;t go through. It usually takes less than a minute to fix.",
              button("{update_payment_url}", "Update My Card"))
    b += summary("Payment Details",
                 [("Amount", "{installment_payment_amount}"),
                  ("Date", "{installment_payment_date}"),
                  ("Reason", "{failure_reason}")])
    b += p("{installment_payment_retry_message}", mb=24, color=NAVY, align="center")
    b += ticks("What Happens Next",
               ["You have 10 days to update your card.",
                "We hold your upcoming visits until the payment goes through.",
                "As soon as it&rsquo;s paid, your visits go right back on the schedule."])
    b += closing("If you think this is a mistake, call or text us and we&rsquo;ll sort it out.")
    return page("Your Hero Club payment didn&rsquo;t go through",
                "Your Hero Club payment didn&rsquo;t go through. Update your card to keep your visits on schedule.",
                b, footer("Questions about your payment? We&rsquo;re here to help."))


# ---------- HC 6. Payment still unpaid, day 7 (ad hoc; contact shortcodes) ----------

def hero_club_payment_reminder():
    b = greeting()
    b += hero("Your Payment Is Still Outstanding",
              "Your Hero Club payment hasn&rsquo;t gone through yet, and your visits are on hold. Updating your card takes less than a minute.",
              button("{contact.update_payment_url}", "Update My Card"))
    b += summary("Payment Details",
                 [("Amount", fillin("AMOUNT")),
                  ("Originally Due", fillin("DATE DUE")),
                  ("Pay By", fillin("END DATE"))],
                 note="If we can&rsquo;t collect this payment by the pay-by date, your membership will end under the cancellation terms of your agreement.")
    b += closing("If something has changed, call or text us. We&rsquo;d rather work it out with you.")
    return page("Your Hero Club payment is still outstanding",
                "Your Hero Club payment is still unpaid and your visits are on hold.",
                b, footer("Questions about your payment? We&rsquo;re here to help."))


# ---------- HC 7. Renewal notice (ad hoc). Required by N.C. Gen. Stat. 75-41. ----------
# Send on its own, 15 to 45 days before the renewal date. No marketing in this one.

def hero_club_renewal_notice():
    b = greeting()
    b += hero("Your Hero Club Membership Is Renewing",
              "Your Hero Club " + fillin("PLAN") + " membership renews automatically on " + fillin("RENEWAL DATE") + " for another 12 months.")
    b += summary("Your Renewal Year",
                 [("Property", "{fullserviceaddress}"),
                  ("Renewal Date", fillin("RENEWAL DATE")),
                  ("Down Payment", fillin("NEW DOWN PAYMENT") + ", charged on your renewal date"),
                  ("Monthly Charge", fillin("NEW MONTHLY CHARGE") + ", 12 charges starting one month after your renewal date"),
                  ("Also Due on Your Renewal Date", "your last monthly charge for this year, " + fillin("CURRENT MONTHLY CHARGE"))],
                 note="These are our prices for your plan and home size today and may be different from what you pay now. All charges go to the card we have on file.")
    b += card(
        heading("If You Do Not Want to Renew", align="left", mb=10) +
        p("Tell us any time before " + fillin("RENEWAL DATE") + ". You can:", mb=10, color=NAVY) +
        check_rows(["Reply to this email.",
                    "Call or text {organization.phone}.",
                    "Email {organization.email}."], NAVY, cols=1, pad="4px 0") +
        p("<strong>There is no charge for not renewing.</strong>", mb=0, color=NAVY).replace('<p style="', '<p style="margin-top:12px; ', 1).replace("margin-top:12px; margin:0 0 0px 0;", "margin:12px 0 0 0;"),
        "#ffffff", border="#d9e2ec")
    b += ticks("What Stays the Same",
               ["The services included in your plan.",
                "Your member discount on additional services.",
                "Everything else in your Hero Club Membership Agreement."])
    b += closing("Thank you for being a Hero Club member.")
    return page("Your Hero Club membership renews soon",
                "Your Hero Club membership renews automatically. Here are the date, the charges, and how to opt out.",
                b, footer("Questions about your renewal? We&rsquo;re here to help."))


# ---------- HC 8. Cancellation confirmation (ad hoc) ----------

def hero_club_cancellation():
    b = greeting()
    b += hero("Your Cancellation Is Confirmed",
              "Your Hero Club membership ends on " + fillin("END DATE") + ". No monthly charges will run after that date.")
    b += summary("How We Settled Up",
                 [("Property", "{fullserviceaddress}"),
                  ("Services You Received, at Regular Prices", fillin("SERVICES RECEIVED AMOUNT")),
                  ("What You Paid", fillin("AMOUNT PAID")),
                  ("Balance Due", fillin("BALANCE DUE OR $0"))],
                 note="Your agreement compares the regular price of the services you received with what you paid. If there is a balance, it is charged to the card on file on your end date. If the balance is $0, nothing more is owed and no refund is due.")
    b += closing("Thank you for being a Hero Club member. If your plans change, we&rsquo;d be glad to have you back.")
    return page("Your Hero Club cancellation is confirmed",
                "Your Hero Club membership is ending. Here is your end date and how we settled up.",
                b, footer("Questions about your cancellation? We&rsquo;re here to help."))


# ---------- HC 9. Referral: telling a member how it works (ad hoc) ----------

def hero_club_referral_invite():
    b = greeting()
    b += hero("Give a Month, Get a Month",
              "Refer a neighbor to the Hero Club. When they join, you each get a month free.")
    b += ticks("How It Works",
               ["Tell a neighbor about the Hero Club.",
                "When they join, they give us your name and street address.",
                "Their twelfth month is free.",
                "You get a credit on your bill worth their monthly charge, up to one month of your own plan."])
    b += card(
        heading("The Details", align="left", mb=10) +
        check_rows(["Your neighbor needs to tell us who referred them before they sign.",
                    "Your credit applies once they&rsquo;ve paid their down payment and first monthly charge, while your membership is active.",
                    "Your neighbor must be new to the Hero Club. Past one-time Window Hero customers count as new.",
                    "You can earn up to 12 credits in each membership year.",
                    "Credits come off monthly charges, have no cash value, and can&rsquo;t be transferred."],
                   GREY, size=14, cols=1, pad="3px 0") +
        p("Ask us for the full referral terms any time.", mb=0, size=14).replace('<p style="', '<p style="margin-top:10px; ', 1).replace("margin-top:10px; margin:0 0 0px 0;", "margin:10px 0 0 0;"),
        "#f7f9fc", border="#d9e2ec")
    b += closing("Thank you for being a Hero Club member, and for spreading the word.")
    return page("Give a month, get a month",
                "Refer a neighbor to the Hero Club and you each get a month free.",
                b, footer("Questions about referrals? We&rsquo;re here to help."))


# ---------- HC 10. Referral: your neighbor named you (ad hoc) ----------

def hero_club_referral_named():
    b = greeting()
    b += hero("Thank You for the Referral",
              fillin("NEIGHBOR FIRST NAME") + " is joining the Hero Club and told us you sent them.")
    b += ticks("What Happens Next",
               ["Your neighbor signs up and pays their down payment.",
                "One month later, their first monthly charge goes through.",
                "Your credit then comes off your next Hero Club payment, and we&rsquo;ll email you to confirm."])
    b += closing("Thank you for spreading the word. It means a lot to our team.")
    return page("Thank you for the referral",
                "Your neighbor told us you referred them to the Hero Club. Thank you!",
                b, footer("Questions about referrals? We&rsquo;re here to help."))


# ---------- HC 11. Referral: your credit has been applied (ad hoc) ----------

def hero_club_referral_credit():
    b = greeting()
    b += hero("Your Referral Credit Is Here",
              fillin("NEIGHBOR FIRST NAME") + " is now a Hero Club member, so " + fillin("CREDIT AMOUNT") + " is coming off your next Hero Club payment.")
    b += summary("Your Credit",
                 [("For Referring", fillin("NEIGHBOR FIRST NAME")),
                  ("Credit", fillin("CREDIT AMOUNT")),
                  ("Applied To", "your next monthly charge")],
                 note="You can earn up to 12 referral credits in each membership year. A neighbor just needs to give us your name and street address when they join.")
    b += closing("Thank you for spreading the word.")
    return page("Your Hero Club referral credit",
                "Your referral credit is coming off your next Hero Club payment.",
                b, footer("Questions about your credit? We&rsquo;re here to help."))


# ---------- HC 12. Referral: the new member's free month (ad hoc) ----------

def hero_club_referral_welcome():
    b = greeting()
    b += hero("Your Twelfth Month Is on Us",
              "Because " + fillin("REFERRER FIRST NAME") + " referred you, your twelfth monthly Hero Club payment is free.")
    b += ticks("How It Works",
               ["You don&rsquo;t need to do anything. We&rsquo;ve already set it up.",
                "Your first eleven monthly charges run as normal.",
                "Your twelfth monthly charge is free, as long as your membership is still active."])
    b += card(
        heading("Know Someone Else?", mb=10) +
        p("You can refer your own neighbors too. Have them give us your name and street address when they join, and you each get a month free.",
          mb=10, align="center", color=NAVY) +
        p(REFERRAL_SMALL, mb=0, align="center", size=14),
        "#f7f9fc", border="#d9e2ec")
    b += closing("Welcome to the Hero Club. We&rsquo;re glad you&rsquo;re here.")
    return page("Your twelfth Hero Club month is free",
                "Because a member referred you, your twelfth monthly payment is on us.",
                b, footer("Questions about your membership? We&rsquo;re here to help."))


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "emails")
    os.makedirs(out, exist_ok=True)
    for name, fn in [("service-complete.html", service_complete),
                     ("commercial-proposal.html", commercial_proposal),
                     ("residential-proposal.html", residential_proposal),
                     ("appointment-confirmation.html", appointment_confirmation),
                     ("appointment-reminder.html", appointment_reminder),
                     ("on-our-way.html", on_our_way),
                     ("reschedule-notice.html", reschedule_notice),
                     ("proposal-follow-up.html", proposal_follow_up),
                     ("invoice.html", invoice),
                     ("receipt.html", receipt),
                     ("hero-club-welcome-bronze.html", hero_club_welcome("bronze")),
                     ("hero-club-welcome-silver.html", hero_club_welcome("silver")),
                     ("hero-club-welcome-gold.html", hero_club_welcome("gold")),
                     ("hero-club-proposal-follow-up.html", hero_club_proposal_follow_up),
                     ("hero-club-visit-reminder.html", hero_club_visit_reminder),
                     ("hero-club-visit-complete.html", hero_club_visit_complete),
                     ("hero-club-payment-failed.html", hero_club_payment_failed),
                     ("hero-club-payment-reminder.html", hero_club_payment_reminder),
                     ("hero-club-renewal-notice.html", hero_club_renewal_notice),
                     ("hero-club-cancellation.html", hero_club_cancellation),
                     ("hero-club-referral-invite.html", hero_club_referral_invite),
                     ("hero-club-referral-named.html", hero_club_referral_named),
                     ("hero-club-referral-credit.html", hero_club_referral_credit),
                     ("hero-club-referral-welcome.html", hero_club_referral_welcome)]:
        html = fn()
        with open(os.path.join(out, name), "w", encoding="utf-8") as f:
            f.write(html)
        print(name, len(html.encode("utf-8")), "bytes")
