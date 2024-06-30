import { makeCastAdd, NobleEd25519Signer } from "@farcaster/hub-nodejs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export const getSigner = async () => {
  const ed25519Signer = new NobleEd25519Signer(process.env.PRIVATE_KEY as any);
  return ed25519Signer;
};

const Farcaster = ({ castLink, fid }: { castLink: string; fid: any }) => {
  const dataOptions = {
    fid,
    network: 1,
  };
  const castLinkHandler = async () => {
    const cast = await makeCastAdd(
      {
        type: 0,
        text: castLink,
        embeds: [],
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
      },
      dataOptions,
      await getSigner()
    );
  };
  return (
    <button
      className="bg-gray-500 text-white w-10 h-10 rounded-full"
      onClick={castLinkHandler}
    >
      <FontAwesomeIcon icon={faPaperPlane} />
    </button>
  );
};

export default Farcaster;
