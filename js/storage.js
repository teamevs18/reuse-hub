/* storage.js – all data access lives here. To move to Firebase/Supabase later,
   replace load/save/reset with async calls; app.js only uses this Store object. */
const Store = (() => {
  const KEY = 'reusehub.v1';
  let mem = null; // fallback if LocalStorage is blocked
  const D = (type, title, category, description, price, condition, location, x = {}) => ({
    id: 'd' + Math.random().toString(36).slice(2, 9), type, title, category, description, price,
    condition, location, contact: 'demo@example.com (demo only)', image: '', status: 'available',
    demo: true, created: Date.now() - Math.floor(Math.random() * 8e8), ...x });
  const demoItems = () => {
    const L = 'Sample City';
    return [
      D('sell', 'Used Engineering Textbooks (Set of 4)', 'Books and Study Materials', 'First-year engineering books, a few pencil notes, no torn pages.', 450, 'Good', L),
      D('sell', 'Scientific Calculator', 'Electronics', 'Works perfectly, allowed in most exams. Cover included.', 600, 'Good', L),
      D('sell', 'Study Table', 'Furniture', 'Sturdy wooden table with one drawer. Pickup only.', 1800, 'Good', L),
      D('sell', 'School/College Backpack', 'Clothing and Accessories', 'Spacious bag with laptop sleeve, zips all working.', 350, 'Like New', L),
      D('sell', 'Wired Headphones', 'Electronics', 'Clear sound, 3.5mm jack, cushions slightly worn.', 500, 'Good', L),
      D('sell', 'Drawing Instruments Set', 'Books and Study Materials', 'Compass, divider, set squares in a metal box.', 200, 'Like New', L),
      D('sell', 'Used Bicycle', 'Sports Equipment', 'Adult bicycle, rides well, needs new tyres soon.', 3500, 'Fair', L),
      D('sell', 'Desk Lamp', 'Home Essentials', 'Adjustable LED desk lamp with working switch.', 250, 'Good', L),
      D('free', 'Old Class 10 Textbooks', 'Books and Study Materials', 'Free to any student who can use them.', 0, 'Good', L),
      D('free', 'Extra Stationery', 'Other', 'Unused notebooks, pens and files.', 0, 'New', L),
      D('free', 'Reusable Containers', 'Home Essentials', 'Clean glass jars and plastic boxes with lids.', 0, 'Good', L),
      D('free', 'Unwanted Household Items', 'Home Essentials', 'Mugs, plates and a small mirror. Take what you need.', 0, 'Fair', L),
      D('exchange', 'Engineering Drawing Kit', 'Books and Study Materials', 'Complete kit, lightly used.', 0, 'Good', L, { want: 'Scientific calculator' }),
      D('exchange', 'Novel Collection (6 books)', 'Books and Study Materials', 'Popular fiction paperbacks in good shape.', 0, 'Good', L, { want: 'Desk lamp' }),
      D('exchange', 'Yoga Mat', 'Sports Equipment', 'Non-slip mat, cleaned and rolled.', 0, 'Like New', L, { want: 'Dumbbells (pair)' }),
      D('service', 'Phone Screen & Battery Repair (sample)', 'Mobile Phones', 'Sample listing – not a real or verified business.', 'Est. ₹500–₹2500', '', L),
      D('service', 'Bicycle Tune-up (sample)', 'Bicycles', 'Sample listing – brakes, gears and puncture fixes.', 'Est. ₹150–₹600', '', L),
      D('service', 'Laptop Cleaning & Upgrade (sample)', 'Computers and Laptops', 'Sample listing – fan cleaning, RAM/SSD upgrade help.', 'Est. ₹400–₹1500', '', L),
      D('service', 'Bag Zip & Clothes Stitching (sample)', 'Clothing and Bags', 'Sample listing – zips, straps and small tailoring.', 'Est. ₹50–₹300', '', L),
      D('service', 'Furniture Fixing (sample)', 'Furniture', 'Sample listing – loose joints, hinges, polish.', 'Est. ₹300–₹1200', '', L)
    ];
  };
  const fresh = () => ({ v: 1, items: demoItems(), requests: [] });
  function load() {
    try { const r = localStorage.getItem(KEY); if (r) { const d = JSON.parse(r); if (d && Array.isArray(d.items) && Array.isArray(d.requests)) return d; } } catch (e) { /* ignore */ }
    return mem || (mem = fresh());
  }
  function save(d) { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  // Replace demo listings with fresh ones; keep the user's own data.
  function resetDemo(d) { d.items = d.items.filter(i => !i.demo).concat(demoItems()); d.requests = d.requests.filter(r => !String(r.targetId).startsWith('d')); return d; }
  function clearAll() { return fresh(); }
  return { load, save, resetDemo, clearAll };
})();
