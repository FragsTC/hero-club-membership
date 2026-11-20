#!/bin/sh
# Remakes the Word copies in docs/hero-club-documents/ from the .md originals.
# Run from the repository root after changing any of them: sh scripts/make-word-copies.sh
set -e
out=docs/hero-club-documents
mkdir -p "$out"
make() { pandoc "$1" -f gfm -o "$out/$2.docx" && echo "made $out/$2.docx"; }
make docs/agreement/hero-club-membership-agreement.md 1-membership-agreement
make docs/agreement/lawyer-review-notes.md            2-lawyer-review-notes
make docs/agreement/serviceminder-setup.md            3-serviceminder-setup
make docs/agreement/office-routine.md                 4-office-routine
make docs/referrals/referral-terms.md                 5-referral-terms
make docs/referrals/office-steps.md                   6-referral-office-steps
make docs/referrals/messages.md                       7-referral-messages
make docs/sales/tech-scripts.md                       8-tech-scripts
make email-templates/HERO-CLUB-EMAILS.md              9-email-templates-guide
