import React, { useState } from "react";
import "./MenuMgmt.css";

function MenuMgmt() {

  const [search, setSearch] = useState("");

  const menuItems = [
    {
      id: 1,
      name: "Chicken Biryani",
      category: "Main Course",
      price: 450,
      available: true,
    },
    {
      id: 2,
      name: "Momo",
      category: "Snacks",
      price: 180,
      available: true,
    },
    {
      id: 3,
      name: "Pizza",
      category: "Fast Food",
      price: 650,
      available: false,
    },
    {
      id: 4,
      name: "Coffee",
      category: "Beverages",
      price: 120,
      available: true,
    },
  ];

  return (
    <div className="menu-page">

      <div className="menu-header">

        <div>
          <h1>Menu Management</h1>
          <p>Manage restaurant menu items.</p>
        </div>

        <button className="menu-add-btn">
          + Add Menu Item
        </button>

      </div>

      <div className="menu-stats">

        <div className="menu-card">
          <h3>Total Items</h3>
          <span>{menuItems.length}</span>
        </div>

        <div className="menu-card">
          <h3>Available</h3>
          <span>{menuItems.filter(x=>x.available).length}</span>
        </div>

        <div className="menu-card">
          <h3>Unavailable</h3>
          <span>{menuItems.filter(x=>!x.available).length}</span>
        </div>

        <div className="menu-card">
          <h3>Categories</h3>
          <span>4</span>
        </div>

      </div>

      <div className="menu-toolbar">

        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select>
          <option>All Categories</option>
          <option>Main Course</option>
          <option>Snacks</option>
          <option>Beverages</option>
          <option>Fast Food</option>
        </select>

      </div>

      <div className="menu-table-container">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Food Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

          {menuItems
          .filter(x=>x.name.toLowerCase().includes(search.toLowerCase()))
          .map(item=>(

            <tr key={item.id}>

              <td>{item.id}</td>

              <td>{item.name}</td>

              <td>{item.category}</td>

              <td>Rs. {item.price}</td>

              <td>

                <span className={item.available ? "available":"unavailable"}>
                  {item.available ? "Available":"Unavailable"}
                </span>

              </td>

              <td>

                <button className="view-btn">View</button>

                <button className="edit-btn">Edit</button>

                <button className="delete-btn">Delete</button>

              </td>

            </tr>

          ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default MenuMgmt;