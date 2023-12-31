import React, { useEffect, useState } from "react";
import {
  getGuideByID,
  getUserByID,
  updateDescription,
  addStep,
  deleteStep,
  updateSteppie,
  publishGuide,
  unpublishGuide,
  deleteGuide,
  userAuthenticated,
} from "../../api";

import { useNavigate, useParams } from "react-router";
import { getID, getUser } from "../../auth";
import { storage } from "../../firebase.js";
import { FiEdit } from "react-icons/fi";
import { BsCardImage } from "react-icons/bs";
import { FaUpload } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { BiSolidHide, BiSolidMessageAdd } from "react-icons/bi";
import { AiOutlineUpload } from "react-icons/ai";

import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import "./editguide.css";
import { BadAuth } from "../../components";

const Editguide = () => {
  const [guide, setGuide] = useState([]);
  const [user, setUser] = useState("");
  const [guidePFP, setGuidePFP] = useState([]);
  const [stepImages, setStepImages] = useState([]);
  const [descriptionStatus, setDescriptionStatus] = useState(true);
  const [descriptionHtml, setDescriptionHtml] = useState(null);
  const [showEditDescriptionButton, setShowEditDescriptionButton] =
    useState(true);
  const [showAddStepButton, setShowAddStepButton] = useState(true);
  const [newStepHtml, setNewStepHtml] = useState(null);
  const [editedStepIndex, setEditedStepIndex] = useState("");
  const [editedStepHtml, setEditedStepHtml] = useState(null);
  const [userAuth, setUserAuth] = useState(false);

  const { id } = useParams();
  const key = getID();
  const activeUser = getUser();
  const stepImagesRef = ref(storage, "/images/" + id);
  const guidePFPRef = ref(storage, "/guidepfp/");
  let inputed_img;
  let steppies = guide.steps;
  let counter = 0;
  let stepCounter = 0;
  let list = [];
  let navigate = useNavigate();

  const metadata = {
    contentType: "image/jpg",
  };

  const handleImageChange = (e, value) => {
    // console.log(e.target.files[0].name);
    if (e.target.files[0] === null) {
    } else {
      inputed_img = e.target.files[0];
      if (value === "pfp") {
        uploadImagePFP(id);
        return;
      } else {
        uploadImage(id, value);
      }
    }
  };

  function uploadImage(id, index) {
    const imageRef = ref(
      storage,
      `${"images/" + id + "/" + "!" + index + "!"}`
    );
    uploadBytes(imageRef, inputed_img, metadata).then((snapshot) => {});
  }

  function uploadImagePFP(id) {
    if (inputed_img === undefined) {
      // console.log("IMAGE NULL");
      alert("Please select an image to upload.");
      return;
    } else {
      const deleteRef = ref(storage, "/guidepfp/" + "_" + id + "_");
      deleteObject(deleteRef).then(() => {
        // deletes existing pfp
      });
      // console.log("this is image upload", imageUpload)
      const imageRef = ref(storage, "guidepfp/" + "_" + id + "_");
      // console.log("this is imageRef",imageRef)
      uploadBytes(imageRef, inputed_img, metadata).then((snapshot) => {
        // alert("Guide PFP uploaded.");
        window.location.reload();
      });
    }
  }

  function renderDescriptionBox(id) {
    try {
      async function getDescriptionData() {
        let newDescriptionData = await document.getElementById(
          "editguide-description-textarea"
        ).value;
        if (newDescriptionData.length > 1000) {
          alert("Description too long. Please use less then 1000 characters.");
          document.location.reload();
        } else {
          const authCheck = await userAuthenticated(activeUser);
          // console.log(authCheck.data.auth);
          if (authCheck.data.auth === true) {
            let updatedDescription = await updateDescription(
              id,
              newDescriptionData
            );
            document.location.reload();
            return updatedDescription;
          } else {
            alert("Auth check has failed. Please log in again.");
          }
        }
      }
      return (
        <div className="waw__editguide-rendered-description-div">
          <div>
            <textarea
              id="editguide-description-textarea"
              type="text"
              max-length="700"
              defaultValue={guide.description}
            ></textarea>
            <div>
              <button
                className="waw__editguide-update-description-button"
                onClick={async () => {
                  await getDescriptionData();
                }}
              >
                Update &nbsp;
                <FaUpload />
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      throw error;
    }
  }

  function renderNewStep(id, stepIndex) {
    try {
      async function getStepData() {
        let newStepData = await document.getElementById("step-area").value;
        // console.log("this should be new step data:", newStepData);
        if (newStepData !== null) {
          let addedSteppie = await addStep(id, newStepData);
          return addedSteppie;
        } else {
          alert("Please enter Step data.");
          window.location.reload();
        }
      }

      return (
        <div className="waw__editguide-newstep-div">
          <div>
            <textarea
              id="step-area"
              maxLength="2000"
              placeholder="Enter new step here..."
            ></textarea>
            <div>
              <button
                onClick={async () => {
                  await getStepData();
                  window.location.reload();
                }}
              >
                Add Step &nbsp;
                <FaUpload />
              </button>
              <input
                className="waw__editguide-step-image-input"
                type="file"
                accept="image/jpg, image/jpeg, image/png"
                // onChange={handleImageChange}
                onChange={(e) => {
                  handleImageChange(e, stepIndex);
                }}
              ></input>
              {/* <button
                className="waw__editguide-uploadss"
                onClick={() => {
                  uploadImage(id, stepIndex);
                }}
              >
                Upload Screenshot
              </button> */}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      throw error;
    }
  }

  function renderEditStepBox(id, index, stepCounter, step) {
    try {
      async function getNewStepData() {
        let newStepData = await document.getElementById("editguide-step-data")
          .value;
        let newStep = await updateSteppie(id, stepCounter, newStepData);
        console.log(newStep);
        if (!newStep) {
          alert("Auth check has failed. Please relog.");
        }
        // return newStep;
      }

      return (
        <div className="waw__editguide-editstep-div">
          <div>
            <textarea id="editguide-step-data">{step}</textarea>
            <div>
              <div>
                <button
                  onClick={async () => {
                    await getNewStepData();
                    window.location.reload();
                  }}
                >
                  Update &nbsp; <FaUpload />
                </button>
                <button
                  className="caution"
                  onClick={async () => {
                    await deleteStep(id, stepCounter);
                    alert("Step deleted.");
                    window.location.reload();
                  }}
                >
                  Delete &nbsp; <TfiTrash />
                </button>

                <input
                  className="waw__editguide-step-image-input"
                  type="file"
                  accept="image/jpg, image/jpeg, image/png"
                  // onChange={handleImageChange}
                  onChange={(e) => {
                    handleImageChange(e, stepCounter);
                  }}
                ></input>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      throw error;
    }
  }

  async function fetchGuide() {
    const foundGuide = await getGuideByID(id);
    const user = await getUserByID(key);
    setGuide(foundGuide.blog);
    setUser(user.user);
  }

  async function fetchUserAuth() {
    const userAuth = await userAuthenticated(activeUser);
    setUserAuth(userAuth.data.auth);
  }

  useEffect(() => {
    fetchUserAuth();
    fetchGuide();
    listAll(stepImagesRef).then((res) => {
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setStepImages((prev) => [...prev, url]);
        });
      });
    });
    listAll(guidePFPRef).then((res) => {
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setGuidePFP((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  if (userAuth !== true) {
    return <BadAuth />;
  }

  return (
    <div className="waw__editguide">
      <div className="waw__editguide-container">
        {guide.author !== user ? (
          <div>
            <h1>Page Not authorized.</h1>
          </div>
        ) : (
          <div className="waw__editguide-guide">
            <div className="waw__editguide-header-div">
              {guidePFP &&
                guidePFP.map((image) => {
                  let guideImageId = image.split("_");
                  guideImageId = guideImageId[1];
                  list.push(guideImageId);
                  if (guide._id === guideImageId) {
                    return (
                      <div className="waw__editguide-img-div">
                        <img src={image}></img>
                      </div>
                    );
                  }
                })}
              {!list.includes(guide._id) && (
                <div className="waw__editguide-img-div">
                  <img src="https://www.ecpi.edu/sites/default/files/whitehat.png" />
                </div>
              )}
              <div className="waw__editguide_details-div">
                <h3 className="gradient_text">{guide.vmtitle}</h3>
                <p>
                  Created On: <a>{guide.date}</a>
                </p>
                <p>
                  Posted By: <a>{guide.author}</a>
                </p>
                <p>
                  Hosted By: <a>{guide.hostedby}</a>
                </p>
                <p>
                  Rating: <a>{guide.difficulty}</a>
                </p>
              </div>
            </div>

            <div className="waw__editguide-uploadpfp-div">
              <label>
                &nbsp; <BsCardImage /> &nbsp;
              </label>
              <input
                className="editguide-image-input-PFP"
                type="file"
                accept="image/jpg, image/jpeg, image/png"
                // onChange={handleImageChange}
                onChange={(e) => {
                  handleImageChange(e, "pfp");
                }}
              ></input>
            </div>

            {descriptionStatus && (
              <div className="waw__editguide-description-div">
                <p>{guide.description}</p>
                {showEditDescriptionButton && (
                  <button
                    onClick={() => {
                      setShowEditDescriptionButton(false);
                      setDescriptionStatus(false);
                      setDescriptionHtml(renderDescriptionBox(guide._id));
                    }}
                  >
                    <FiEdit />
                  </button>
                )}
              </div>
            )}
            {descriptionHtml}

            <div className="waw__editguide-step-div">
              {steppies ? (
                steppies.map((step, i) => {
                  if (step === null) {
                    stepCounter += 1;
                    var stepCounterIndex = stepCounter - 1;
                    return;
                  }

                  if (step.step === null) {
                    stepCounter += 1;
                    stepCounterIndex = stepCounter - 1;
                    return;
                  }
                  counter = counter + 1;
                  var index = counter - 1;
                  var stepCounterIndex = stepCounter;
                  stepCounter += 1;

                  return (
                    <div className="waw__editguide-step" key={i}>
                      <div className="waw__editguide-step-step">
                        {editedStepIndex === index ? (
                          <div> {editedStepHtml}</div>
                        ) : (
                          <div>
                            <p>{step.step}</p>

                            {stepImages
                              ? stepImages.map((image) => {
                                  let index = image.split("!")[1];
                                  // console.log("first index after split:",index)
                                  // index = index[index.length - 2 ] + index[index.length - 1];
                                  // console.log(index)

                                  // console.log(stepCounterIndex)
                                  if (index === stepCounterIndex.toString()) {
                                    return (
                                      <div className="editguide-uploaded-img-div">
                                        <img src={image} alt="Step Img" />
                                      </div>
                                    );
                                  }
                                })
                              : null}
                          </div>
                        )}
                      </div>

                      <div className="waw__editguide-editstep-button">
                        {editedStepIndex !== index && (
                          <button
                            onClick={() => {
                              setEditedStepIndex(index);
                              setEditedStepHtml(
                                renderEditStepBox(
                                  id,
                                  index,
                                  stepCounterIndex,
                                  step.step
                                )
                              );
                            }}
                          >
                            <FiEdit />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <h3>Guide Has no steps.</h3>
              )}
            </div>
            {newStepHtml}
            {showAddStepButton && (
              <div className="waw__editguide-addstep-div">
                <button
                  className="waw__editguide-addstep-button1"
                  onClick={() => {
                    setShowAddStepButton(false);
                    setNewStepHtml(renderNewStep(guide._id, stepCounter));
                  }}
                >
                  Add New Step &nbsp;
                  <p className="addstep-icon">
                    <BiSolidMessageAdd />
                  </p>
                </button>
                <div className="waw__editguide_publish_delete_buttons">
                  {guide.published ? (
                    <button
                      className="waw__editguide-publish-button1"
                      onClick={() => {
                        unpublishGuide(guide._id);
                        alert("Guide is now hidden from public view.");
                        window.location.reload();
                      }}
                    >
                      Unpublish &nbsp;{" "}
                      <p className="unpublish-icon">
                        <BiSolidHide />
                      </p>
                    </button>
                  ) : (
                    <button
                      className="waw__editguide-publish-button1"
                      onClick={() => {
                        publishGuide(guide._id);
                        alert(
                          "Guide is now public. A dev will now review your guide."
                        );
                        window.location.reload();
                      }}
                    >
                      Publish &nbsp;{" "}
                      <p className="publish-icon">
                        &nbsp;
                        <AiOutlineUpload />
                      </p>
                    </button>
                  )}

                  <button
                    className="waw__editguide-delete-button1"
                    onClick={() => {
                      deleteGuide(guide._id);
                      alert("Guide has been deleted.");
                      navigate("/Profile");
                      window.location.reload();
                    }}
                  >
                    Delete Guide &nbsp;{" "}
                    <p className="delete-guide-icon">
                      <TfiTrash />
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Editguide;
