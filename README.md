# น้องมันม่วง Connect — WU BUS

Frontend prototype for **Walailak University Smart Bus Tracking System**.

## Run

```bash
npm install
npm run dev
```

## Demo login
- Student: any 8 digits + password at least 4 characters
- Guest: any 13 digits + password at least 4 characters
- Driver: any 6 digits + password at least 4 characters
- Admin: use the demo admin link on the login screen

## Map source of truth
The file `public/wu-route-reference.jpg` is the exact uploaded reference image. The map view uses this image directly so the route geometry and bus-stop placement are not regenerated or guessed by the prototype.

## Notes
This is a frontend-only prototype using local mock data. Replace arrays in `src/main.jsx` with API/service calls when backend, GPS, and seat sensor endpoints are available.
