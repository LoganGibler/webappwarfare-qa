import React, { useEffect, useState } from "react";
import "./guideform.css";
import logo from "../../pics/logoBlue.png";
import { getUser } from "../../auth";
import { createGuide, userAuthenticated } from "../../api";
import { useNavigate } from "react-router-dom";
import BadAuth from "../badauth/BadAuth";

const GuideForm = () => {
  let navigate = useNavigate();
  let author = getUser();
  let [vmtitle, setvmtitle] = useState("");
  let [hostedby, setHostedBy] = useState("");
  let [description, setDescription] = useState("");
  let [difficulty, setDifficulty] = useState("");
  let [titleRequirements, setTitleRequirements] = useState(false);
  let [hostRequirements, setHostRequirements] = useState(false);
  let [userAuth, setUserAuth] = useState(false);

  function getCategoryOption() {
    let selectElement = document.querySelector("#dropdown_difficulty");
    let output = selectElement.options[selectElement.selectedIndex].value;
    return output;
  }

  async function fetchUserAuth() {
    const userAuth = await userAuthenticated(author);
    setUserAuth(userAuth.data.auth);
  }

  useEffect(() => {
    fetchUserAuth();
  }, []);

  if (userAuth !== true) {
    return <BadAuth />;
  }

  return (
    <div className="waw__guideform">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (vmtitle.length > 16) {
              alert("Vmtitle has to many characters. Please use 16 or less.");
            } else if (hostedby.length > 16) {
              alert("Hostname has to many characters. Please use 16 or less.");
            } else if (description.length > 2000) {
              alert(
                "Please use less then 2000 characters for the description."
              );
            } else if (!vmtitle || !hostedby || !difficulty) {
              alert("Please fill out all required fields.");
            } else {
              const data = await createGuide(
                vmtitle,
                hostedby,
                description,
                difficulty,
                author
              );
              if (data) {
                alert("Guide created successfully.");
                navigate("/Profile");
              } else {
                alert("Guide creation failed. Please try again.");
              }
            }
          } catch (error) {
            throw error;
          }
        }}
      >
        <div>
          <div>
            <h4 className="">WebAppWarfare</h4>
            <p>Guide Form</p>
          </div>
          <img src={logo}></img>
        </div>
        <div className="waw__createguide-inputs">
          <label>VM Title</label>
          <input
            maxLength={16}
            placeholder="Enter VM name..."
            className="waw__guideform-vmtitle"
            onChange={(e) => {
              setvmtitle(e.target.value);
            }}
            onClick={() => {
              setTitleRequirements(true);
              setHostRequirements(false);
            }}
          ></input>
          {titleRequirements && (
            <li className="waw__guideform-requirements">
              Title must be 16 characters or less.
            </li>
          )}
          <label className="waw__guideform-hostname-label">Hostname</label>
          <div className="waw__guideform-host-diff">
            <input
              maxLength={16}
              placeholder="Where can this VM be found?"
              className="waw__guideform-host"
              onChange={(e) => {
                setHostedBy(e.target.value);
              }}
              onClick={() => {
                setHostRequirements(true);
                setTitleRequirements(false);
              }}
            ></input>
            <select
              name="difficulty"
              id="dropdown_difficulty"
              defaultValue={difficulty}
              onChange={async (e) => {
                let selected_difficulty1 = await getCategoryOption();
                setDifficulty(selected_difficulty1);
              }}
            >
              <option disabled={true} value="">
                Difficulty
              </option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Insane">Insane</option>
            </select>
          </div>
          {hostRequirements && (
            <li className="waw__guideform-requirements">
              {" "}
              Hostname must be 16 characters or less.
            </li>
          )}
        </div>

        <div className="waw__guideform-desc-label-div">
          <label className="waw__guideform-desc-label">VM Description</label>
        </div>

        <div className="waw__guideform-textarea">
          <textarea
            maxLength={2000}
            onClick={() => {
              setHostRequirements(false);
            }}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder="*Optional* - Please provide a brief description of this box. No Spoilers!"
          ></textarea>
        </div>
        <div className="waw__guideform-createguide-button">
          <button>Create Guide</button>
        </div>
      </form>
    </div>
  );
};

export default GuideForm;
