// Cache tag for the home page's featured project/property lists.
//
// Those lists are the only public reads that go stale in a way nobody notices:
// the sections are hidden when the list is empty, so a stale-and-empty cache
// entry deletes them from the page rather than showing an obviously wrong
// value. Tagging them lets every admin write bust the data itself, not just the
// rendered HTML — see revalidatePublicProjects / revalidatePublicProperties.
export const INVENTORY_TAG = "inventory";
