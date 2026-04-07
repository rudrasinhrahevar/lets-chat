import { SearchIcon } from "@heroicons/react/solid";

export default function SearchUsers({ handleSearch }) {
  return (
    <div className="mx-4 my-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          id="search"
          name="search"
          className="input-field w-full pl-12"
          placeholder="Search conversations..."
          type="search"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
