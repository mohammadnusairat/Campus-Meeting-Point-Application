## Overview:

**When**: 4/18/2025 @ 4:30pm
**Duration**: 30min
**Where**: Online

## Attendance

**Late**: N/A
**Missing**: N/A

## Recent Progress:

Mo -> 'Disjoint Set' finds neartest path with N number of locations. Currently not integrated into frontend
Ivan -> Autocomplete half complete with filters, was not able to get to PopUp modal
Adrian -> Integrated Google Maps into Frontend

## Meeting Notes:

During this meeting we discussed what we wanted to present for FGP6. We spent most of our time on deciding what to show for the final demo. Given these considerations, we also made some changes to the use of the application. The biggest thing that we changed about our application came from the use of the Google Maps API.
During the first couple weeks of this project, we decided to void using sockets to dimish the complexities of this project, though that made the approach rather tedious due to the user having to send everyone's ETA's and directions separately. Due to this monotonous approach, the usefulness of this application would diminish...
So instead we decided to lean on the Google Maps API to alleviate the work load. Now, instead of giving non-dynamic directions, we will create a URL pointing to the closest location found using our backend. Assuming that users know how to use Google Maps, the URL generated will serve as a way for the group to find their way to the pinned location. We plan to expand this with the filters we have included in the Frontend.

## Action Items (Work In Progress):

Mo -> Apply filters to best optimized path for N nodes
Ivan -> Finish Trie implementation with filters and introduce Modal PopUp
Adrian -> Replace ETA and directions with closest location found, and pin to Google Map API. Generate URL to said location to have user distribute to group
