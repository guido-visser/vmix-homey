//@ts-ignore
import parser from "xml2json-light";

const vMixAPI = async (ip: string) => {
    const res = await fetch(`http://${ip}:8088/api`);
    const xml = await res.text();
    const json = parser.xml2json(xml);
    return json.vmix;
};

export { vMixAPI };
